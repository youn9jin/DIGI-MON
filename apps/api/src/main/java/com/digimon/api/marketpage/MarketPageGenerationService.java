package com.digimon.api.marketpage;

import com.digimon.api.market.Market;
import com.digimon.api.market.MarketRepository;
import com.digimon.api.marketpage.dto.AiGenerateRequest;
import com.digimon.api.store.Store;
import com.digimon.api.store.StoreRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * 시장 페이지 생성 백그라운드 작업.
 *
 * 동작 흐름 (@Async):
 *  1) DB 에서 market + stores 조회 (별도 read-only 트랜잭션)
 *  2) FastAPI POST /generate 호출 (WebClient.block, 응답 타임아웃 60s)
 *  3) 성공: content_json 저장 + status DONE + SSE DONE 발행
 *     실패/타임아웃: status FAILED + SSE FAILED 발행
 *
 * 트랜잭션 분할 이유: WebClient 호출이 60s 까지 걸릴 수 있는데, 그동안 DB 트랜잭션을
 * 잡고 있으면 커넥션 고갈/락 위험이 있다. 그래서 generateAsync 자체는 트랜잭션 밖이고,
 * 짧은 read/write 만 self-injection 으로 별도 트랜잭션을 연다.
 *
 * Q5-B: SSE register 호출처가 아직 없으므로 sendDone/sendFailed 는 사실상 no-op 이지만,
 *       추후 PR 에서 register 가 붙으면 자동으로 동작하도록 호출은 그대로 둔다.
 * Q6-A: FastAPI 측 /generate 엔드포인트 부재 시 운영에서는 4xx/5xx 가 떨어지며,
 *       그에 따라 status 가 FAILED 로 마킹된다 (예외 처리에 흡수됨).
 */
@Service
public class MarketPageGenerationService {

    private static final Logger log = LoggerFactory.getLogger(MarketPageGenerationService.class);
    private static final String GENERATE_PATH = "/generate";

    private final WebClient aiWebClient;
    private final MarketRepository marketRepository;
    private final StoreRepository storeRepository;
    private final MarketPageRepository marketPageRepository;
    private final MarketPageConfigRepository marketPageConfigRepository;
    private final ObjectMapper objectMapper;
    private final SseEmitterManager sseEmitterManager;
    private final MarketPageGenerationService self;

    public MarketPageGenerationService(WebClient aiWebClient,
                                       MarketRepository marketRepository,
                                       StoreRepository storeRepository,
                                       MarketPageRepository marketPageRepository,
                                       MarketPageConfigRepository marketPageConfigRepository,
                                       ObjectMapper objectMapper,
                                       SseEmitterManager sseEmitterManager,
                                       @Lazy MarketPageGenerationService self) {
        this.aiWebClient = aiWebClient;
        this.marketRepository = marketRepository;
        this.storeRepository = storeRepository;
        this.marketPageRepository = marketPageRepository;
        this.marketPageConfigRepository = marketPageConfigRepository;
        this.objectMapper = objectMapper;
        this.sseEmitterManager = sseEmitterManager;
        this.self = self;
    }

    /**
     * 비동기 진입점. MarketPageService.startGeneration() 직후 호출되며,
     * 호출 즉시 별도 스레드(marketPageAsyncExecutor) 로 넘어간다.
     * template_type / selected_sections / user_content 는 buildRequest 내부에서 market_page_configs 로부터 읽는다.
     */
    @Async("marketPageAsyncExecutor")
    public void generateAsync(Long pageId, Long marketId) {
        try {
            AiGenerateRequest body = self.buildRequest(marketId);

            try {
                log.info("[FastAPI request] pageId={} body={}", pageId, objectMapper.writeValueAsString(body));
            } catch (Exception e) {
                log.warn("request logging failed", e);
            }

            String responseJson = aiWebClient.post()
                    .uri(GENERATE_PATH)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    // WebClient.block 은 자체 타임아웃 인자를 받지 않더라도
                    // ReactorClientHttpConnector 의 responseTimeout(60s) 이 그대로 적용된다.
                    .block();

            // HTTP 는 성공(2xx)이지만 바디가 비어있는 경우(예: 빈 응답/204). AI 응답 없음으로 간주 → FAILED.
            if (responseJson == null || responseJson.isBlank()) {
                self.markFailed(pageId);
                sseEmitterManager.sendFailed(pageId, "AI 서버 응답이 비어 있습니다.");
                return;
            }

            self.markDone(pageId, responseJson);
            sseEmitterManager.sendDone(pageId);

        } catch (WebClientResponseException e) {
            String reason = "FastAPI " + e.getStatusCode().value() + " " + safeMessage(e.getMessage());
            log.warn("market page generation failed (pageId={}): {}", pageId, reason);
            self.markFailed(pageId);
            sseEmitterManager.sendFailed(pageId, reason);
        } catch (Exception e) {
            String reason = e.getClass().getSimpleName() + ": " + safeMessage(e.getMessage());
            log.warn("market page generation failed (pageId={}): {}", pageId, reason);
            self.markFailed(pageId);
            sseEmitterManager.sendFailed(pageId, reason);
        }
    }

    /**
     * FastAPI /generate 요청 본문을 빌드한다.
     * 사양: null 인 필드는 미포함(NON_NULL 직렬화). 빈 배열은 그대로 직렬화.
     *
     * template_type / selected_sections / user_content 는 market_page_configs 에서 읽는다.
     * (이 메서드 도달 시점에 setup 은 이미 완료되어 있음 — startGeneration 의 SETUP 체크가 선행)
     */
    @Transactional(readOnly = true)
    public AiGenerateRequest buildRequest(Long marketId) {
        Market market = marketRepository.findById(marketId)
                // 이 시점에 market 이 사라졌다는 건 동시 삭제 등 이례적 상황. 일반 예외로 흐르게 둠.
                .orElseThrow(() -> new IllegalStateException("market not found: " + marketId));

        MarketPageConfig config = marketPageConfigRepository.findByMarketId(marketId)
                // SETUP 체크를 통과했으므로 정상 흐름에선 존재. 동시 삭제 등 이례적 상황만 여기 도달.
                .orElseThrow(() -> new IllegalStateException("market page config not found: " + marketId));

        List<Store> stores = storeRepository.findByMarketId(marketId);

        AiGenerateRequest.MarketDto marketDto = AiGenerateRequest.MarketDto.builder()
                .name(market.getName())
                .address(market.getAddress())
                .marketType(market.getMarketType())
                .mainCategories(toList(market.getMainCategories()))
                .totalStores(market.getTotalStores())
                .operatingHours(parseOperatingHours(market.getOperatingHours()))
                .targetCustomers(market.getTargetCustomers())
                .contact(market.getContact())
                .description(market.getDescription())
                .managerName(market.getManagerName())
                .managerTitle(market.getManagerTitle())
                .build();

        List<AiGenerateRequest.StoreDto> storeDtos = stores.stream()
                .map(s -> AiGenerateRequest.StoreDto.builder()
                        .name(s.getName())
                        .category(s.getCategory())
                        .items(s.getItems())
                        .operatingHours(s.getOperatingHours())
                        .yearsOfOperation(s.getYearsOfOperation())
                        .contact(s.getContact())
                        .description(s.getDescription())
                        .build())
                .toList();

        return AiGenerateRequest.builder()
                .market(marketDto)
                .stores(storeDtos)
                .templateType(config.getTemplateType())
                .selectedSections(config.getSelectedSections())
                .userContent(buildUserContent(config))
                .build();
    }

    /**
     * markets.operating_hours 는 {"weekday":...,"weekend":...} JSON 문자열로 저장되어 있다.
     * FastAPI 는 문자열을 기대하므로 OperatingHoursDto 로 확인 후 사람이 읽는 문장으로 변환한다.
     */
    private String parseOperatingHours(String operatingHoursJson) {
        if (operatingHoursJson == null || operatingHoursJson.isBlank()) {
            return null;
        }
        try {
            AiGenerateRequest.OperatingHoursDto dto =
                    objectMapper.readValue(operatingHoursJson, AiGenerateRequest.OperatingHoursDto.class);
            String weekday = dto.getWeekday();
            String weekend = dto.getWeekend();
            if (weekday != null && weekend != null) {
                return "평일 " + weekday + ", 주말 " + weekend;
            }
            if (weekday != null) {
                return "평일 " + weekday;
            }
            if (weekend != null) {
                return "주말 " + weekend;
            }
            return null;
        } catch (Exception e) {
            log.warn("operating_hours 파싱 실패, 원본 문자열로 처리: {}", safeMessage(e.getMessage()));
            return operatingHoursJson;
        }
    }

    /**
     * user_content 빌드. 세 텍스트가 모두 null 이면 null 반환 → 상위에서 user_content 키 자체가 생략된다(Q6-B).
     */
    private AiGenerateRequest.UserContentDto buildUserContent(MarketPageConfig config) {
        String intro = config.getIntroText();
        String history = config.getHistoryText();
        String directions = config.getDirectionsText();
        if (intro == null && history == null && directions == null) {
            return null;
        }
        return AiGenerateRequest.UserContentDto.builder()
                .introText(intro)
                .historyText(history)
                .directionsText(directions)
                .build();
    }

    /** FastAPI 응답 성공 시: row 에 응답 본문 저장 + status DONE. */
    @Transactional
    public void markDone(Long pageId, String contentJson) {
        marketPageRepository.findById(pageId).ifPresent(page -> {
            page.setStatus(MarketPageStatus.DONE);
            page.setContentJson(contentJson);
        });
    }

    /** FastAPI 호출 실패/타임아웃 시: row status FAILED. content_json 은 유지(직전 성공값 보존). */
    @Transactional
    public void markFailed(Long pageId) {
        marketPageRepository.findById(pageId).ifPresent(page -> {
            page.setStatus(MarketPageStatus.FAILED);
        });
    }

    private static List<String> toList(String[] arr) {
        if (arr == null) {
            return null;
        }
        if (arr.length == 0) {
            return Collections.emptyList();
        }
        return Arrays.asList(arr);
    }

    private static String safeMessage(String message) {
        if (message == null) {
            return "";
        }
        return message.length() > 200 ? message.substring(0, 200) : message;
    }
}

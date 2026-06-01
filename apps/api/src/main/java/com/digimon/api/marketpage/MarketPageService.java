package com.digimon.api.marketpage;

import com.digimon.api.auth.ForbiddenException;
import com.digimon.api.market.Market;
import com.digimon.api.market.MarketRepository;
import com.digimon.api.marketpage.dto.AiGenerateResponse;
import com.digimon.api.marketpage.dto.MarketPageContentResponse;
import com.digimon.api.user.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * POST /api/market/page 도메인 서비스 — 동기 영역.
 *
 * 책임:
 *  1) user → market 조회 (없으면 404 MARKET_NOT_FOUND)
 *  2) market_page_configs 존재 확인 (없으면 400 SETUP_NOT_COMPLETED). templateType 도 여기서 읽는다.
 *  3) 동일 market 의 page row 가 이미 PENDING 인지 확인 (이미면 400 ALREADY_IN_PROGRESS)
 *  4) row 가 있으면 reset (status=PENDING, contentJson=null, templateType 갱신), 없으면 신규 INSERT
 *  5) 백그라운드 작업 트리거 (MarketPageGenerationService.generateAsync, @Async)
 *
 * 변경: templateType 은 더 이상 요청 본문에서 받지 않고 market_page_configs 에서 읽는다.
 *       setup 시점에 이미 TEMPLATE_1/2/3 으로 검증되었으므로 여기서 재검증하지 않는다.
 */
@Service
public class MarketPageService {

    /** SSE 연결 타임아웃 3분. 60초 AI 타임아웃 + 여유분. */
    private static final long SSE_TIMEOUT_MS = 180_000L;

    /** 실패 사유는 아직 DB 에 저장하지 않으므로(스코프 외) 고정 메시지 사용. */
    private static final String FAILED_MESSAGE = "생성에 실패했습니다.";

    private final MarketRepository marketRepository;
    private final MarketPageRepository marketPageRepository;
    private final MarketPageConfigRepository marketPageConfigRepository;
    private final MarketPageGenerationService generationService;
    private final SseEmitterManager sseEmitterManager;
    private final ObjectMapper objectMapper;

    public MarketPageService(MarketRepository marketRepository,
                             MarketPageRepository marketPageRepository,
                             MarketPageConfigRepository marketPageConfigRepository,
                             MarketPageGenerationService generationService,
                             SseEmitterManager sseEmitterManager,
                             ObjectMapper objectMapper) {
        this.marketRepository = marketRepository;
        this.marketPageRepository = marketPageRepository;
        this.marketPageConfigRepository = marketPageConfigRepository;
        this.generationService = generationService;
        this.sseEmitterManager = sseEmitterManager;
        this.objectMapper = objectMapper;
    }

    /**
     * @return 생성된(또는 재사용되는) market_pages.page_id
     */
    @Transactional
    public Long startGeneration(User user) {
        Market market = marketRepository.findByUserId(user.getId())
                .orElseThrow(() -> new MarketPageMarketNotFoundException(
                        "등록된 시장이 없습니다. 먼저 온보딩을 완료해주세요."));

        // 생성 트리거 전 setup(market_page_configs) 선행 필수. templateType 도 config 에서 읽는다.
        MarketPageConfig config = marketPageConfigRepository.findByMarketId(market.getId())
                .orElseThrow(() -> new SetupNotCompletedException(
                        "페이지 생성 설정이 완료되지 않았습니다. 먼저 /api/market/page/setup 을 호출해주세요."));
        String templateType = config.getTemplateType();

        Optional<MarketPage> existing = marketPageRepository.findByMarketId(market.getId());

        MarketPage page;
        if (existing.isPresent()) {
            page = existing.get();
            if (page.getStatus() == MarketPageStatus.PENDING) {
                throw new AlreadyInProgressException("이미 생성 중인 페이지가 있습니다.");
            }
            page.setStatus(MarketPageStatus.PENDING);
            page.setTemplateType(templateType);
            // 새 생성 사이클 시작 — 직전 결과는 비워둔다.
            page.setContentJson(null);
            // 스케줄러가 created_at 기준으로 stale PENDING 을 정리하므로,
            // 재생성 시작 시점을 기준으로 created_at 도 갱신해 방금 시작된 작업이
            // 다음 tick 에서 즉시 FAILED 로 마킹되는 것을 방지한다.
            page.setCreatedAt(LocalDateTime.now());
        } else {
            page = MarketPage.builder()
                    .market(market)
                    .templateType(templateType)
                    .status(MarketPageStatus.PENDING)
                    .build();
        }

        MarketPage saved = marketPageRepository.save(page);
        Long pageId = saved.getId();

        // 트랜잭션 커밋 후 비동기로 호출되도록 — @Async 메서드는 호출 즉시 별도 스레드로 넘어간다.
        // 별도 스레드에서 read-only 로 다시 조회하므로 commit 시점에 영향받지 않음.
        // template_type / selected_sections / user_content 는 generateAsync 가 config 에서 다시 읽는다.
        generationService.generateAsync(pageId, market.getId());

        return pageId;
    }

    /**
     * GET /api/market/page/status/{pageId} SSE 구독.
     *
     * 흐름:
     *  1) pageId row 없으면 404 PAGE_NOT_FOUND
     *  2) 해당 page 가 요청자 본인 market 소속이 아니면 403 FORBIDDEN
     *  3) 이미 DONE/FAILED → emitter 등록 후 즉시 해당 이벤트 push + complete
     *  4) PENDING → emitter 등록 후 연결 유지. 단, 등록 직후 status 를 DB 에서 재확인하여
     *     register 직전에 @Async 가 끝나버린 race 를 보정한다(완료됐으면 즉시 push).
     *
     * @param userId 요청자(User) 의 내부 PK
     * @return 구독용 SseEmitter (Controller 가 그대로 반환 → Spring 이 text/event-stream 으로 처리)
     */
    @Transactional(readOnly = true)
    public SseEmitter connectStatus(Long pageId, Long userId) {
        MarketPage page = marketPageRepository.findById(pageId)
                .orElseThrow(() -> new PageNotFoundException("해당 페이지를 찾을 수 없습니다."));

        // 소유권 확인: 요청자 본인 market 의 id 와 page 의 market_id 가 일치해야 한다.
        // page.getMarket().getId() 는 FK(market_id)가 market_pages 에 있어 lazy proxy 에서도 추가 쿼리 없이 획득.
        Long pageMarketId = page.getMarket().getId();
        boolean owned = marketRepository.findByUserId(userId)
                .map(m -> m.getId().equals(pageMarketId))
                .orElse(false);
        if (!owned) {
            throw new ForbiddenException("해당 페이지에 접근 권한이 없습니다.");
        }

        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);
        sseEmitterManager.register(pageId, emitter);

        MarketPageStatus status = page.getStatus();
        if (status == MarketPageStatus.PENDING) {
            // register 직전/직후 @Async 가 commit 했을 수 있으므로 DB 최신값으로 재확인(race 보정).
            status = marketPageRepository.findStatusById(pageId).orElse(MarketPageStatus.PENDING);
        }

        if (status == MarketPageStatus.DONE) {
            sseEmitterManager.sendDone(pageId);
        } else if (status == MarketPageStatus.FAILED) {
            sseEmitterManager.sendFailed(pageId, FAILED_MESSAGE);
        }
        // PENDING 이면 등록 상태 유지 → 생성 완료 시 generateAsync 가 push.

        return emitter;
    }

    /**
     * GET /api/market/page/{pageId} 콘텐츠 조회.
     *
     * 흐름:
     *  1) pageId row 없으면 404 PAGE_NOT_FOUND
     *  2) 해당 page 가 요청자 본인 market 소속이 아니면 403 FORBIDDEN
     *  3) status != DONE 이면 409 PAGE_NOT_READY
     *  4) content_json 파싱 + selected_sections 필터링 후 응답 DTO 반환
     *
     * 정책:
     * - market_page_configs 가 없으면 selectedSections = null, 필터링 없이 전체 반환.
     * - templateType 은 config 우선. config 가 없으면 page.templateType("A" 기본값 가능) 대신 null 반환.
     */
    @Transactional(readOnly = true)
    public MarketPageContentResponse getPageContent(Long pageId, Long userId) {
        MarketPage page = marketPageRepository.findById(pageId)
                .orElseThrow(() -> new PageNotFoundException("해당 페이지를 찾을 수 없습니다."));

        Long pageMarketId = page.getMarket().getId();
        boolean owned = marketRepository.findByUserId(userId)
                .map(m -> m.getId().equals(pageMarketId))
                .orElse(false);
        if (!owned) {
            throw new ForbiddenException("해당 페이지에 접근 권한이 없습니다.");
        }

        if (page.getStatus() != MarketPageStatus.DONE) {
            throw new PageNotReadyException("페이지 생성이 아직 완료되지 않았습니다.");
        }

        String contentJson = page.getContentJson();
        if (contentJson == null || contentJson.isBlank()) {
            throw new IllegalStateException("DONE 상태인데 content_json 이 비어 있습니다. pageId=" + pageId);
        }

        final AiGenerateResponse generated;
        try {
            generated = objectMapper.readValue(contentJson, AiGenerateResponse.class);
        } catch (Exception e) {
            throw new IllegalStateException("content_json 파싱 실패. pageId=" + pageId, e);
        }

        Optional<MarketPageConfig> configOpt = marketPageConfigRepository.findByMarketId(pageMarketId);
        List<String> selectedSections = configOpt.map(MarketPageConfig::getSelectedSections).orElse(null);

        // Q3: config 가 없으면 page.templateType 기본값(\"A\")을 그대로 노출하지 않고 null 을 반환한다.
        String templateType = configOpt.map(MarketPageConfig::getTemplateType).orElse(null);

        // selectedSections 가 null 이면 setup 없이 생성된 케이스로 보고 필터링 없이 전체 반환.
        boolean shouldFilter = selectedSections != null;
        boolean includeIntro = !shouldFilter || containsSection(selectedSections, "intro");
        boolean includeFeatures = !shouldFilter
                || containsSection(selectedSections, "directions")
                || containsSection(selectedSections, "tourism");
        boolean includeStores = !shouldFilter || containsSection(selectedSections, "stores");

        return MarketPageContentResponse.builder()
                .pageId(page.getId())
                .templateType(templateType)
                .selectedSections(selectedSections)
                .hero(toHeroDto(generated.getHero()))
                .intro(includeIntro ? toIntroDto(generated.getIntro()) : null)
                .features(includeFeatures ? toFeatureDtos(generated.getFeatures()) : null)
                .storeHighlights(includeStores ? toStoreHighlightDtos(generated.getStoreHighlights()) : null)
                .cta(toCtaDto(generated.getCta()))
                .build();
    }

    private static MarketPageContentResponse.HeroDto toHeroDto(AiGenerateResponse.Hero hero) {
        if (hero == null) {
            return null;
        }
        return MarketPageContentResponse.HeroDto.builder()
                .title(hero.getTitle())
                .subtitle(hero.getSubtitle())
                .description(hero.getDescription())
                .build();
    }

    private static MarketPageContentResponse.IntroDto toIntroDto(AiGenerateResponse.Intro intro) {
        if (intro == null) {
            return null;
        }
        return MarketPageContentResponse.IntroDto.builder()
                .content(intro.getContent())
                .build();
    }

    private static List<MarketPageContentResponse.FeatureDto> toFeatureDtos(List<AiGenerateResponse.Feature> features) {
        if (features == null) {
            return null;
        }
        return features.stream()
                .map(f -> MarketPageContentResponse.FeatureDto.builder()
                        .title(f.getTitle())
                        .description(f.getDescription())
                        .build())
                .toList();
    }

    private static List<MarketPageContentResponse.StoreHighlightDto> toStoreHighlightDtos(
            List<AiGenerateResponse.StoreHighlight> storeHighlights) {
        if (storeHighlights == null) {
            return null;
        }
        return storeHighlights.stream()
                .map(s -> MarketPageContentResponse.StoreHighlightDto.builder()
                        .storeName(s.getStoreName())
                        .highlight(s.getHighlight())
                        .build())
                .toList();
    }

    private static MarketPageContentResponse.CtaDto toCtaDto(AiGenerateResponse.Cta cta) {
        if (cta == null) {
            return null;
        }
        return MarketPageContentResponse.CtaDto.builder()
                .text(cta.getText())
                .build();
    }

    private static boolean containsSection(List<String> selectedSections, String section) {
        return selectedSections != null && selectedSections.contains(section);
    }
}

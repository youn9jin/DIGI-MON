package com.digimon.api.marketpage;

import com.digimon.api.market.Market;
import com.digimon.api.market.MarketRepository;
import com.digimon.api.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

/**
 * POST /api/market/page 도메인 서비스 — 동기 영역.
 *
 * 책임:
 *  1) templateType 화이트리스트 검증
 *  2) user → market 조회 (없으면 404)
 *  3) 동일 market 의 page row 가 이미 PENDING 인지 확인 (이미면 400 ALREADY_IN_PROGRESS)
 *  4) Q3-B 결정에 따라 row 가 있으면 reset (status=PENDING, contentJson=null, templateType 갱신),
 *     없으면 신규 INSERT
 *  5) 백그라운드 작업 트리거 (MarketPageGenerationService.generateAsync, @Async)
 *
 * 주의: 4) 의 이유로, 사양 문구 "INSERT" 는 코드 상 INSERT or UPDATE(upsert) 가 된다.
 *       사용자 명시 — "동작 규칙 6번 체크는 '해당 market의 page row status가 PENDING인지'로 구현".
 */
@Service
public class MarketPageService {

    private static final Set<String> ALLOWED_TEMPLATE_TYPES =
            Set.of("TEMPLATE_1", "TEMPLATE_2", "TEMPLATE_3");

    private final MarketRepository marketRepository;
    private final MarketPageRepository marketPageRepository;
    private final MarketPageConfigRepository marketPageConfigRepository;
    private final MarketPageGenerationService generationService;

    public MarketPageService(MarketRepository marketRepository,
                             MarketPageRepository marketPageRepository,
                             MarketPageConfigRepository marketPageConfigRepository,
                             MarketPageGenerationService generationService) {
        this.marketRepository = marketRepository;
        this.marketPageRepository = marketPageRepository;
        this.marketPageConfigRepository = marketPageConfigRepository;
        this.generationService = generationService;
    }

    /**
     * @return 생성된(또는 재사용되는) market_pages.page_id
     */
    @Transactional
    public Long startGeneration(User user, String templateType) {
        validateTemplateType(templateType);

        Market market = marketRepository.findByUserId(user.getId())
                .orElseThrow(() -> new MarketPageMarketNotFoundException(
                        "등록된 시장이 없습니다. 먼저 온보딩을 완료해주세요."));

        // 생성 트리거 전 setup(market_page_configs) 선행 필수.
        if (!marketPageConfigRepository.findByMarketId(market.getId()).isPresent()) {
            throw new SetupNotCompletedException(
                    "페이지 생성 설정이 완료되지 않았습니다. 먼저 /api/market/page/setup 을 호출해주세요.");
        }

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
        // 별도 스레드에서 saved.getId() 를 read-only 로 다시 조회하므로 commit 시점에 영향받지 않음.
        generationService.generateAsync(pageId, market.getId(), templateType);

        return pageId;
    }

    private static void validateTemplateType(String templateType) {
        if (templateType == null || !ALLOWED_TEMPLATE_TYPES.contains(templateType)) {
            throw new InvalidTemplateTypeException(
                    "templateType 은 TEMPLATE_1, TEMPLATE_2, TEMPLATE_3 중 하나여야 합니다.");
        }
    }
}

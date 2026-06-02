package com.digimon.api.marketpage;

import com.digimon.api.market.Market;
import com.digimon.api.market.MarketRepository;
import com.digimon.api.marketpage.dto.UpdateMarketPageTemplateRequest;
import com.digimon.api.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

/**
 * PATCH /api/market/page/template 도메인 서비스.
 *
 * AI 재생성 없이 market_page_configs 와 DONE market_pages 의 template_type 만 함께 갱신한다.
 */
@Service
public class MarketPageTemplateService {

    /** API 가 허용하는 템플릿 타입 화이트리스트. */
    private static final Set<String> ALLOWED_TEMPLATE_TYPES =
            Set.of("TEMPLATE_1", "TEMPLATE_2", "TEMPLATE_3");

    private final MarketRepository marketRepository;
    private final MarketPageRepository marketPageRepository;
    private final MarketPageConfigRepository marketPageConfigRepository;

    public MarketPageTemplateService(MarketRepository marketRepository,
                                     MarketPageRepository marketPageRepository,
                                     MarketPageConfigRepository marketPageConfigRepository) {
        this.marketRepository = marketRepository;
        this.marketPageRepository = marketPageRepository;
        this.marketPageConfigRepository = marketPageConfigRepository;
    }

    /**
     * 요청 템플릿을 검증하고 두 테이블의 template_type 을 같은 값으로 갱신한다.
     */
    @Transactional
    public Result updateTemplate(User user, UpdateMarketPageTemplateRequest request) {
        // 잘못된 요청은 DB 조회 전에 즉시 400 INVALID_TEMPLATE_TYPE 으로 종료한다.
        String templateType = request != null ? request.getTemplateType() : null;
        if (templateType == null || !ALLOWED_TEMPLATE_TYPES.contains(templateType)) {
            throw new InvalidTemplateTypeException(
                    "templateType 은 TEMPLATE_1, TEMPLATE_2, TEMPLATE_3 중 하나여야 합니다.");
        }

        // 요청자 소유 시장이 없으면 명세에 따라 404 MARKET_NOT_FOUND 를 반환한다.
        Market market = marketRepository.findByUserId(user.getId())
                .orElseThrow(() -> new MarketPageMarketNotFoundException(
                        "등록된 시장이 없습니다. 먼저 온보딩을 완료해주세요."));

        // market_id 는 unique 이므로 PENDING 이면 DONE 조회보다 먼저 중단한다.
        marketPageRepository.findByMarketIdAndStatus(market.getId(), MarketPageStatus.PENDING)
                .ifPresent(page -> {
                    throw new AlreadyInProgressException("이미 생성 중인 페이지가 있습니다.");
                });

        // 템플릿 교체는 AI 생성이 완료된 페이지에만 허용한다.
        MarketPage page = marketPageRepository.findByMarketIdAndStatus(market.getId(), MarketPageStatus.DONE)
                .orElseThrow(() -> new PageNotFoundException("생성 완료된 페이지를 찾을 수 없습니다."));

        // config 가 없으면 두 테이블을 일관되게 갱신할 수 없으므로 비정상 페이지로 처리한다.
        MarketPageConfig config = marketPageConfigRepository.findByMarketId(market.getId())
                .orElseThrow(() -> new PageNotFoundException("페이지 생성 설정을 찾을 수 없습니다."));

        // 동일 값 요청도 멱등 성공으로 처리하되 저장 로직은 그대로 실행한다.
        config.setTemplateType(templateType);
        page.setTemplateType(templateType);

        // 두 테이블을 한 트랜잭션 안에서 모두 저장하여 template_type 불일치를 방지한다.
        marketPageConfigRepository.save(config);
        marketPageRepository.save(page);

        return new Result(market.getId(), templateType);
    }

    /** 컨트롤러 응답 구성에 사용하는 템플릿 교체 결과 컨테이너. */
    public static class Result {

        private final Long marketId;
        private final String templateType;

        public Result(Long marketId, String templateType) {
            this.marketId = marketId;
            this.templateType = templateType;
        }

        public Long getMarketId() {
            return marketId;
        }

        public String getTemplateType() {
            return templateType;
        }
    }
}

package com.digimon.api.marketpage;

import com.digimon.api.market.Market;
import com.digimon.api.market.MarketRepository;
import com.digimon.api.marketpage.dto.MarketContentDto;
import com.digimon.api.marketpage.dto.SaveMarketPageSetupRequest;
import com.digimon.api.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * POST /api/market/page/setup 도메인 서비스.
 *
 * 처리 순서 (명세 3~10):
 *  3) user → market 조회 (없으면 404 MARKET_NOT_FOUND)
 *  4) templateType 화이트리스트 검증 (400 INVALID_TEMPLATE_TYPE)
 *  5) selectedSections null/빈 검증 (400 NO_SECTIONS_SELECTED)
 *  6) selectedSections 요소 화이트리스트 검증 (400 INVALID_SECTION_VALUE)
 *  7) 동일 market 의 market_pages row 가 PENDING 이면 (400 ALREADY_IN_PROGRESS)
 *  8) market_page_configs UPSERT (market_id 기준, 있으면 전체 덮어쓰기)
 *  9) marketContent null 필드는 null 로 저장
 * 10) 결과 반환
 *
 * (1~2 인증은 컨트롤러에서 처리)
 */
@Service
public class MarketPageSetupService {

    private static final Set<String> ALLOWED_TEMPLATE_TYPES =
            Set.of("TEMPLATE_1", "TEMPLATE_2", "TEMPLATE_3");

    private static final Set<String> ALLOWED_SECTIONS =
            Set.of("intro", "history", "directions", "stores", "tourism");

    private final MarketRepository marketRepository;
    private final MarketPageRepository marketPageRepository;
    private final MarketPageConfigRepository marketPageConfigRepository;

    public MarketPageSetupService(MarketRepository marketRepository,
                                  MarketPageRepository marketPageRepository,
                                  MarketPageConfigRepository marketPageConfigRepository) {
        this.marketRepository = marketRepository;
        this.marketPageRepository = marketPageRepository;
        this.marketPageConfigRepository = marketPageConfigRepository;
    }

    /** @return 저장된 설정의 정규화된 결과 (컨트롤러 응답 구성에 사용) */
    @Transactional
    public Result saveSetup(User user, SaveMarketPageSetupRequest request) {
        // 3) market 조회 (404 우선)
        Market market = marketRepository.findByUserId(user.getId())
                .orElseThrow(() -> new MarketPageMarketNotFoundException(
                        "등록된 시장이 없습니다. 먼저 온보딩을 완료해주세요."));

        // 4) templateType 검증
        String templateType = request.getTemplateType();
        if (templateType == null || !ALLOWED_TEMPLATE_TYPES.contains(templateType)) {
            throw new InvalidTemplateTypeException(
                    "templateType 은 TEMPLATE_1, TEMPLATE_2, TEMPLATE_3 중 하나여야 합니다.");
        }

        // 5) selectedSections null/빈 검증
        List<String> selectedSections = request.getSelectedSections();
        if (selectedSections == null || selectedSections.isEmpty()) {
            throw new NoSectionsSelectedException("선택된 섹션이 없습니다.");
        }

        // 6) selectedSections 요소 화이트리스트 검증
        for (String section : selectedSections) {
            if (section == null || !ALLOWED_SECTIONS.contains(section)) {
                throw new InvalidSectionValueException(
                        "허용되지 않은 섹션 값입니다: " + section);
            }
        }

        // 7) PENDING 진행 중 체크
        marketPageRepository.findByMarketId(market.getId()).ifPresent(page -> {
            if (page.getStatus() == MarketPageStatus.PENDING) {
                throw new AlreadyInProgressException("이미 생성 중인 페이지가 있습니다.");
            }
        });

        // 8) market_page_configs UPSERT (market_id 기준)
        Optional<MarketPageConfig> existing = marketPageConfigRepository.findByMarketId(market.getId());

        MarketContentDto content = request.getMarketContent();
        // 방어적 복사 — jsonb 저장값을 요청 리스트와 분리
        List<String> sectionsToSave = new ArrayList<>(selectedSections);

        MarketPageConfig config;
        if (existing.isPresent()) {
            config = existing.get();
            config.setTemplateType(templateType);
            config.setSelectedSections(sectionsToSave);
            // 9) marketContent null 필드는 null 그대로 저장 (기존 값 유지 아님)
            config.setIntroText(content != null ? content.getIntroText() : null);
            config.setHistoryText(content != null ? content.getHistoryText() : null);
            config.setDirectionsText(content != null ? content.getDirectionsText() : null);
            // 요청 이미지 URL 은 null 을 포함해 그대로 덮어쓴다.
            config.setHeroImageUrl(request.getHeroImageUrl());
            config.setLogoImageUrl(request.getLogoImageUrl());
            config.setIntroImageUrls(request.getIntroImageUrls());
        } else {
            config = MarketPageConfig.builder()
                    .market(market)
                    .templateType(templateType)
                    .selectedSections(sectionsToSave)
                    .introText(content != null ? content.getIntroText() : null)
                    .historyText(content != null ? content.getHistoryText() : null)
                    .directionsText(content != null ? content.getDirectionsText() : null)
                    // 요청 이미지 URL 은 null 을 포함해 그대로 저장한다.
                    .heroImageUrl(request.getHeroImageUrl())
                    .logoImageUrl(request.getLogoImageUrl())
                    .introImageUrls(request.getIntroImageUrls())
                    .build();
        }

        marketPageConfigRepository.save(config);

        return new Result(
                market.getId(),
                templateType,
                sectionsToSave,
                config.getHeroImageUrl(),
                config.getLogoImageUrl(),
                config.getIntroImageUrls());
    }

    /** saveSetup 결과 컨테이너. 컨트롤러에서 LinkedHashMap 응답 구성에 사용. */
    public static class Result {
        private final Long marketId;
        private final String templateType;
        private final List<String> selectedSections;
        private final String heroImageUrl;
        private final String logoImageUrl;
        private final List<String> introImageUrls;

        public Result(Long marketId,
                      String templateType,
                      List<String> selectedSections,
                      String heroImageUrl,
                      String logoImageUrl,
                      List<String> introImageUrls) {
            this.marketId = marketId;
            this.templateType = templateType;
            this.selectedSections = selectedSections;
            this.heroImageUrl = heroImageUrl;
            this.logoImageUrl = logoImageUrl;
            this.introImageUrls = introImageUrls;
        }

        public Long getMarketId() {
            return marketId;
        }

        public String getTemplateType() {
            return templateType;
        }

        public List<String> getSelectedSections() {
            return selectedSections;
        }

        public String getHeroImageUrl() {
            return heroImageUrl;
        }

        public String getLogoImageUrl() {
            return logoImageUrl;
        }

        public List<String> getIntroImageUrls() {
            return introImageUrls;
        }
    }
}

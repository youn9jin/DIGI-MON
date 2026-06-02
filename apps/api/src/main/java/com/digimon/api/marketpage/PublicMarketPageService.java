package com.digimon.api.marketpage;

import com.digimon.api.market.Market;
import com.digimon.api.market.MarketRepository;
import com.digimon.api.marketpage.dto.AiGenerateResponse;
import com.digimon.api.marketpage.dto.PublicMarketPageResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * GET /api/market/{marketId} 공개 시장 페이지 조회 서비스.
 *
 * 인증 없이 접근 가능한 데이터만 반환한다.
 * market_pages 는 market_id UNIQUE 이므로 findByMarketId 후 status=DONE 만 허용한다.
 * PENDING/FAILED 또는 row 없음 → PAGE_NOT_FOUND (생성 완료 전 공개 페이지 없음).
 */
@Service
public class PublicMarketPageService {

    private final MarketRepository marketRepository;
    private final MarketPageRepository marketPageRepository;
    private final MarketPageConfigRepository marketPageConfigRepository;
    private final ObjectMapper objectMapper;

    public PublicMarketPageService(MarketRepository marketRepository,
                                     MarketPageRepository marketPageRepository,
                                     MarketPageConfigRepository marketPageConfigRepository,
                                     ObjectMapper objectMapper) {
        this.marketRepository = marketRepository;
        this.marketPageRepository = marketPageRepository;
        this.marketPageConfigRepository = marketPageConfigRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public PublicMarketPageResponse getPublicMarketPage(Long marketId) {
        // 1) markets 조회 — 없으면 404 MARKET_NOT_FOUND (store 전용 409 예외는 사용하지 않음)
        Market market = marketRepository.findById(marketId)
                .orElseThrow(() -> new MarketPageMarketNotFoundException("해당 시장을 찾을 수 없습니다."));

        // 2) market_pages 조회 — 없거나 DONE 이 아니면 404 PAGE_NOT_FOUND (생성 중 PENDING 포함)
        MarketPage page = marketPageRepository.findByMarketId(marketId)
                .filter(p -> p.getStatus() == MarketPageStatus.DONE)
                .orElseThrow(() -> new PageNotFoundException("공개할 수 있는 페이지가 없습니다."));

        // 3) content_json 파싱 — 실패 시 CONTENT_PARSE_ERROR
        String contentJson = page.getContentJson();
        if (contentJson == null || contentJson.isBlank()) {
            throw new ContentParseErrorException("content_json 이 비어 있어 파싱할 수 없습니다.");
        }

        final AiGenerateResponse generated;
        try {
            generated = objectMapper.readValue(contentJson, AiGenerateResponse.class);
        } catch (Exception e) {
            throw new ContentParseErrorException("content_json 파싱에 실패했습니다.", e);
        }

        // 4) market_page_configs — 없으면 selectedSections=[], 이미지·텍스트 null
        Optional<MarketPageConfig> configOpt = marketPageConfigRepository.findByMarketId(marketId);

        List<String> selectedSections = configOpt
                .map(MarketPageConfig::getSelectedSections)
                .orElse(Collections.emptyList());

        // templateType: config 우선, 없으면 market_pages.template_type (DONE row 에 항상 존재)
        String templateType = configOpt
                .map(MarketPageConfig::getTemplateType)
                .orElse(page.getTemplateType());
        String heroImageUrl = configOpt.map(MarketPageConfig::getHeroImageUrl).orElse(null);
        String logoImageUrl = configOpt.map(MarketPageConfig::getLogoImageUrl).orElse(null);
        String introImageUrl = configOpt.map(MarketPageConfig::getIntroImageUrl).orElse(null);
        String introText = configOpt.map(MarketPageConfig::getIntroText).orElse(null);
        String historyText = configOpt.map(MarketPageConfig::getHistoryText).orElse(null);
        String directionsText = configOpt.map(MarketPageConfig::getDirectionsText).orElse(null);

        // 5) 섹션 필터링 없이 파싱 결과 전체 반환 (렌더링 여부는 프론트가 selectedSections 로 결정)
        return PublicMarketPageResponse.builder()
                .pageId(page.getId())
                .marketId(market.getId())
                .templateType(templateType)
                .selectedSections(selectedSections)
                .marketName(market.getName())
                .address(market.getAddress())
                .contact(market.getContact())
                .heroImageUrl(heroImageUrl)
                .logoImageUrl(logoImageUrl)
                .introImageUrl(introImageUrl)
                .introText(introText)
                .historyText(historyText)
                .directionsText(directionsText)
                .hero(toHeroDto(generated.getHero()))
                .intro(toIntroDto(generated.getIntro()))
                .features(toFeatureDtos(generated.getFeatures()))
                .storeHighlights(toStoreHighlightDtos(generated.getStoreHighlights()))
                .cta(toCtaDto(generated.getCta()))
                .build();
    }

    private static PublicMarketPageResponse.HeroDto toHeroDto(AiGenerateResponse.Hero hero) {
        if (hero == null) {
            return null;
        }
        return PublicMarketPageResponse.HeroDto.builder()
                .title(hero.getTitle())
                .subtitle(hero.getSubtitle())
                .description(hero.getDescription())
                .build();
    }

    private static PublicMarketPageResponse.IntroDto toIntroDto(AiGenerateResponse.Intro intro) {
        if (intro == null) {
            return null;
        }
        return PublicMarketPageResponse.IntroDto.builder()
                .content(intro.getContent())
                .build();
    }

    private static List<PublicMarketPageResponse.FeatureDto> toFeatureDtos(List<AiGenerateResponse.Feature> features) {
        if (features == null) {
            return null;
        }
        return features.stream()
                .map(f -> PublicMarketPageResponse.FeatureDto.builder()
                        .title(f.getTitle())
                        .description(f.getDescription())
                        .build())
                .toList();
    }

    private static List<PublicMarketPageResponse.StoreHighlightDto> toStoreHighlightDtos(
            List<AiGenerateResponse.StoreHighlight> storeHighlights) {
        if (storeHighlights == null) {
            return null;
        }
        return storeHighlights.stream()
                .map(s -> PublicMarketPageResponse.StoreHighlightDto.builder()
                        .storeName(s.getStoreName())
                        .highlight(s.getHighlight())
                        .build())
                .toList();
    }

    private static PublicMarketPageResponse.CtaDto toCtaDto(AiGenerateResponse.Cta cta) {
        if (cta == null) {
            return null;
        }
        return PublicMarketPageResponse.CtaDto.builder()
                .text(cta.getText())
                .build();
    }
}

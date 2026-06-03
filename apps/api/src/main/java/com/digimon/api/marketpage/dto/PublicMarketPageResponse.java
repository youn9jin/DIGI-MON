package com.digimon.api.marketpage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * GET /api/market/{marketId} 공개 시장 페이지 응답 DTO.
 *
 * null 필드는 프론트 렌더링 판단용으로 명시적으로 내려야 하므로 NON_NULL 을 사용하지 않는다.
 * 섹션 데이터는 selected_sections 와 무관하게 전부 포함한다(필터링은 프론트 책임).
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicMarketPageResponse {

    private Long pageId;
    private Long marketId;
    private String templateType;
    private List<String> selectedSections;

    private String marketName;
    private String address;
    private String contact;

    private String heroImageUrl;
    private String logoImageUrl;
    private List<String> introImageUrls;

    private String introText;
    private String historyText;
    private String directionsText;

    private HeroDto hero;
    private IntroDto intro;
    private List<FeatureDto> features;
    private List<StoreHighlightDto> storeHighlights;
    private CtaDto cta;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HeroDto {
        private String title;
        private String subtitle;
        private String description;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class IntroDto {
        private String content;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FeatureDto {
        private String title;
        private String description;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StoreHighlightDto {
        private String storeName;
        private String highlight;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CtaDto {
        private String text;
    }
}

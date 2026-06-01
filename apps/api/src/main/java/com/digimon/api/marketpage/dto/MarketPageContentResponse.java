package com.digimon.api.marketpage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * GET /api/market/page/{pageId} 응답 DTO.
 *
 * 주의:
 * - 미선택 섹션은 null 을 "명시적으로" 내려야 하므로 NON_NULL 을 사용하지 않는다.
 * - JSON 필드명은 camelCase (storeHighlights, storeName 등) 그대로 유지한다.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketPageContentResponse {

    private Long pageId;
    private String templateType;
    private List<String> selectedSections;

    private HeroDto hero;                    // always present
    private IntroDto intro;                  // null when "intro" not selected
    private List<FeatureDto> features;       // null when both "directions" and "tourism" are not selected
    private List<StoreHighlightDto> storeHighlights; // null when "stores" not selected
    private CtaDto cta;                      // always present

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

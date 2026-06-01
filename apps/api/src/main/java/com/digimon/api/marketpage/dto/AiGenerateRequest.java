package com.digimon.api.marketpage.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * FastAPI POST /generate 요청 본문 매핑.
 * 키는 snake_case 로 직렬화 (FastAPI 사양). null 필드는 직렬화 시 생략 (사양: "포함하지 않거나 빈 문자열").
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AiGenerateRequest {

    private MarketDto market;

    private List<StoreDto> stores;

    @JsonProperty("template_type")
    private String templateType;

    @JsonProperty("selected_sections")
    private List<String> selectedSections;

    @JsonProperty("user_content")
    private UserContentDto userContent;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class MarketDto {
        private String name;
        private String address;

        @JsonProperty("market_type")
        private String marketType;

        @JsonProperty("main_categories")
        private List<String> mainCategories;

        @JsonProperty("total_stores")
        private String totalStores;

        @JsonProperty("operating_hours")
        private OperatingHoursDto operatingHours;

        @JsonProperty("target_customers")
        private String targetCustomers;

        private String contact;
        private String description;

        @JsonProperty("manager_name")
        private String managerName;

        @JsonProperty("manager_title")
        private String managerTitle;
    }

    /**
     * operating_hours object. markets.operating_hours 에 저장된 JSON 문자열을 역직렬화해 채운다.
     * weekend 가 null 이면 직렬화 시 생략됨(NON_NULL) → FastAPI 는 키 부재를 "주말 미운영"으로 해석.
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class OperatingHoursDto {
        private String weekday;
        private String weekend;
    }

    /**
     * 사용자가 setup 에서 직접 입력한 섹션별 텍스트. market_page_configs 에서 가져온다.
     * 세 필드가 모두 null 이면 상위에서 user_content 자체를 null 로 두어 통째로 생략한다.
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class UserContentDto {

        @JsonProperty("intro_text")
        private String introText;

        @JsonProperty("history_text")
        private String historyText;

        @JsonProperty("directions_text")
        private String directionsText;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class StoreDto {
        private String name;
        private String category;
        private String items;

        @JsonProperty("operating_hours")
        private String operatingHours;

        @JsonProperty("years_of_operation")
        private String yearsOfOperation;

        private String contact;
        private String description;
    }
}

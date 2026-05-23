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
        private String operatingHours;

        @JsonProperty("target_customers")
        private String targetCustomers;

        private String contact;
        private String description;

        @JsonProperty("manager_name")
        private String managerName;

        @JsonProperty("manager_title")
        private String managerTitle;
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

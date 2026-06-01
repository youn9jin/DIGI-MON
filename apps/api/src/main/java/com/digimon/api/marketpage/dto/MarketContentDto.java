package com.digimon.api.marketpage.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * POST /api/market/page/setup 요청의 marketContent 중첩 DTO.
 * market_page_configs 의 intro_text / history_text / directions_text 컬럼에 매핑된다.
 * null 필드는 null 그대로 저장한다(기존 값 유지 아님).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MarketContentDto {

    private String introText;
    private String historyText;
    private String directionsText;
}

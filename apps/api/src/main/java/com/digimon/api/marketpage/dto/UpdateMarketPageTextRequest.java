package com.digimon.api.marketpage.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * PATCH /api/market/page/text 요청 본문.
 *
 * null 필드는 기존 값을 유지한다. 필드별 길이 제한과 빈 요청 검증은 명세 에러 코드를
 * 정확히 반환하기 위해 Bean Validation 대신 Service 에서 처리한다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMarketPageTextRequest {

    /** content_json.hero.subtitle 로 저장. */
    private String heroSubtitle;

    /** content_json.intro.content 로 저장. */
    private String introContent;

    /** content_json.features[0].description 으로 저장. */
    private String feature1Description;

    /** content_json.features[1].description 으로 저장. */
    private String feature2Description;

    /** market_page_configs.history_text 로 저장. */
    private String historyText;

    /** market_page_configs.directions_text 로 저장. */
    private String directionsText;
}

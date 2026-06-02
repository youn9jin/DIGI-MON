package com.digimon.api.marketpage.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * PATCH /api/market/page/template 요청 본문.
 *
 * templateType 허용값 검증은 INVALID_TEMPLATE_TYPE 응답을 정확히 반환하기 위해 Service 에서 수행한다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMarketPageTemplateRequest {

    /** market_page_configs 와 market_pages 양쪽 template_type 에 저장. */
    private String templateType;
}

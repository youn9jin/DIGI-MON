package com.digimon.api.marketpage.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * POST /api/market/page 요청 본문.
 * templateType 화이트리스트(TEMPLATE_1/2/3) 검증은 service 단에서 수행
 * (InvalidTemplateTypeException 으로 코드/메시지 일관성 유지).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateMarketPageRequest {

    @NotBlank(message = "templateType은 필수 입력 항목입니다.")
    private String templateType;
}

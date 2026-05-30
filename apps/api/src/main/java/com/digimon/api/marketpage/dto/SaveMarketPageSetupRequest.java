package com.digimon.api.marketpage.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * POST /api/market/page/setup 요청 본문.
 *
 * 모든 도메인 검증(templateType 화이트리스트, selectedSections null/빈/허용값)은 Service 에서 수행한다.
 * 명세 에러 코드(INVALID_TEMPLATE_TYPE / NO_SECTIONS_SELECTED / INVALID_SECTION_VALUE)를 정확히
 * 매핑하기 위해 Bean Validation 어노테이션은 두지 않는다(CreateMarketPageRequest 와 동일 정책 확장).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SaveMarketPageSetupRequest {

    private String templateType;
    private List<String> selectedSections;
    private MarketContentDto marketContent;
}

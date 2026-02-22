package com.digimon.api.plandraft.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * POST /api/plan-drafts 요청. guestKey는 선택, survey 필수.
 */
@Getter
@Setter
@NoArgsConstructor
public class PlanDraftCreateRequest {

    /** 없거나 blank면 서버에서 새 UUID 생성 */
    private String guestKey;

    @NotNull(message = "survey is required")
    @Valid
    private SurveyDto survey;
}

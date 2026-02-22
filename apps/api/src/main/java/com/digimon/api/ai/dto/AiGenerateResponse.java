package com.digimon.api.ai.dto;

import com.digimon.api.plandraft.dto.PlanActionDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * AI 응답. JSON only, wrapper(success/data) 없음.
 * PRE_LOGIN: { "initialPlan": [ PlanActionDto, ... ] }
 * FINALIZE: { "finalPlan": { ... } } (finalPlan은 Object로 파싱).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiGenerateResponse {

    /** PRE_LOGIN 시 필수. AI는 initialPlan 배열만 반환. */
    private List<PlanActionDto> initialPlan;

    /** FINALIZE 시 반환. PRE_LOGIN 단계에서는 null */
    private Object finalPlan;
}

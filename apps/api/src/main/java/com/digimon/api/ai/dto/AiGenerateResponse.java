package com.digimon.api.ai.dto;

import com.digimon.api.plandraft.dto.InitialPlanDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * AI 응답. digitalLevel은 포함하지 않음(Backend가 관리).
 * FINALIZE 시 JSON 형태: { "finalPlan": { "primaryAction": {...}, "steps": [...] } }
 * → 이 클래스로 역직렬화 시 finalPlan 필드에 해당 객체가 매핑됨.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiGenerateResponse {

    /** stage=PRE_LOGIN 시 필수 */
    private InitialPlanDto initialPlan;

    /** stage=FINALIZE 시 반환. JSON 키 "finalPlan"과 매핑. PRE_LOGIN 단계에서는 null */
    private Object finalPlan;
}

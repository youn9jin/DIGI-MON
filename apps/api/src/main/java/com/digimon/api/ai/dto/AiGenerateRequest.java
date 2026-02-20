package com.digimon.api.ai.dto;

import com.digimon.api.plandraft.DigitalLevel;
import com.digimon.api.plandraft.dto.SurveyDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiGenerateRequest {

    /** Backend 로깅/추적용. 없으면 Backend에서 UUID 생성 */
    private String requestId;

    private AiStage stage;
    private String locale;

    /** Backend가 설문 룰로 계산한 값. AI는 계산하지 않음(필수) */
    private DigitalLevel digitalLevel;

    private SurveyDto survey;
}

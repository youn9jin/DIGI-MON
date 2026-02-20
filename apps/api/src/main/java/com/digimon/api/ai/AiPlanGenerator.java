package com.digimon.api.ai;

import com.digimon.api.plandraft.DigitalLevel;
import com.digimon.api.plandraft.dto.InitialPlanDto;
import com.digimon.api.plandraft.dto.SurveyDto;

public interface AiPlanGenerator {

    /**
     * 설문과 Backend 산정 digitalLevel을 기반으로 초기 액션 플랜을 생성한다.
     * digitalLevel은 Backend 룰로 계산된 값이며, AI 요청 시 전달용(AI는 계산하지 않음).
     */
    InitialPlanDto generateInitialPlan(SurveyDto survey, DigitalLevel digitalLevel);
}

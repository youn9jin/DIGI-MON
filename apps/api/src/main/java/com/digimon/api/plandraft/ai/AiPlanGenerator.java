package com.digimon.api.plandraft.ai;

import com.digimon.api.plandraft.DigitalLevel;
import com.digimon.api.plandraft.dto.InitialPlanDto;
import com.digimon.api.plandraft.dto.SurveyDto;

public interface AiPlanGenerator {

    /**
     * 설문과 디지털 레벨을 기반으로 초기 액션 플랜을 생성한다.
     */
    InitialPlanDto generateInitialPlan(SurveyDto survey, DigitalLevel digitalLevel);
}

package com.digimon.api.ai;

import com.digimon.api.plandraft.DigitalLevel;
import com.digimon.api.plandraft.dto.PlanActionDto;
import com.digimon.api.plandraft.dto.SurveyDto;

import java.util.List;

public interface AiPlanGenerator {

    /**
     * 설문과 Backend 산정 digitalLevel을 기반으로 초기 액션 플랜 목록을 생성한다.
     * digitalLevel은 Backend 룰로 계산된 값이며, AI 요청 시 전달용(AI는 계산하지 않음).
     */
    List<PlanActionDto> generateInitialPlan(SurveyDto survey, DigitalLevel digitalLevel);
}

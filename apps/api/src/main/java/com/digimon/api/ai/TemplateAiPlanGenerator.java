package com.digimon.api.ai;

import com.digimon.api.plandraft.DigitalLevel;
import com.digimon.api.plandraft.dto.InitialPlanDto;
import com.digimon.api.plandraft.dto.PrimaryActionDto;
import com.digimon.api.plandraft.dto.SurveyDto;
import org.springframework.stereotype.Component;

/**
 * AI 연동 전 템플릿 기반 stub. actionCode는 GOOGLE_MAPS_REGISTER 기본 사용.
 */
@Component
public class TemplateAiPlanGenerator implements AiPlanGenerator {

    private static final String ACTION_CODE = "GOOGLE_MAPS_REGISTER";
    private static final String TITLE = "구글 지도에 가게 등록하기";
    private static final String SUMMARY = "근처 검색 유입을 늘리기 위한 첫 단계예요";
    private static final int ESTIMATED_MINUTES = 10;

    @Override
    public InitialPlanDto generateInitialPlan(SurveyDto survey, DigitalLevel digitalLevel) {
        PrimaryActionDto primary = new PrimaryActionDto(
                ACTION_CODE,
                TITLE,
                SUMMARY,
                ESTIMATED_MINUTES
        );
        return new InitialPlanDto(primary);
    }
}

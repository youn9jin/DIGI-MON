package com.digimon.api.ai;

import com.digimon.api.plandraft.DigitalLevel;
import com.digimon.api.plandraft.dto.PlanActionDto;
import com.digimon.api.plandraft.dto.PlanStepDto;
import com.digimon.api.plandraft.dto.SurveyDto;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * AI 연동 전 템플릿 기반 stub. PRE_LOGIN fallback 시 initialPlan 리스트 1개 반환.
 * finalize 실패 시 fallback용 finalPlan 구조 제공.
 */
@Component
public class TemplateAiPlanGenerator implements AiPlanGenerator {

    private static final String ACTION_CODE = "GOOGLE_MAPS_REGISTER";
    private static final String TITLE = "구글 지도에 가게 등록하기";
    private static final String SUMMARY = "근처 검색 유입을 늘리기 위한 첫 단계예요";
    private static final int ESTIMATED_MINUTES = 10;

    /** FINALIZE fallback용 */
    private static final String FINALIZE_ACTION_CODE = "GOOGLE_MAPS_OPTIMIZE";
    private static final String FINALIZE_TITLE = "구글 지도 정보 최적화하기";
    private static final String FINALIZE_SUMMARY = "가게 검색 노출과 신뢰도를 높여요";
    private static final int FINALIZE_ESTIMATED_MINUTES = 15;

    @Override
    public List<PlanActionDto> generateInitialPlan(SurveyDto survey, DigitalLevel digitalLevel) {
        PlanStepDto step = new PlanStepDto("가게 정보 확인", "구글 지도에서 가게명과 주소가 맞는지 확인해 주세요.");
        PlanActionDto action = new PlanActionDto(
                ACTION_CODE,
                TITLE,
                SUMMARY,
                ESTIMATED_MINUTES,
                List.of(step)
        );
        return List.of(action);
    }

    /**
     * AI 호출 실패/타임아웃 시 사용하는 기본 finalPlan 구조.
     */
    public Map<String, Object> generateFinalPlanFallback() {
        Map<String, Object> primaryAction = Map.of(
                "actionCode", FINALIZE_ACTION_CODE,
                "title", FINALIZE_TITLE,
                "summary", FINALIZE_SUMMARY,
                "estimatedMinutes", FINALIZE_ESTIMATED_MINUTES
        );
        List<Map<String, Object>> steps = List.of(
                Map.of(
                        "stepNo", 1,
                        "title", "가게명/카테고리 확인",
                        "description", "구글 지도에서 가게명과 카테고리가 정확한지 확인해 주세요."
                )
        );
        return Map.of("primaryAction", primaryAction, "steps", steps);
    }
}

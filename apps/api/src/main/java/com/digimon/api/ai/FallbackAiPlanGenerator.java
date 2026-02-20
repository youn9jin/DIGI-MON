package com.digimon.api.ai;

import com.digimon.api.plandraft.DigitalLevel;
import com.digimon.api.plandraft.dto.InitialPlanDto;
import com.digimon.api.plandraft.dto.SurveyDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

/**
 * HTTP AI 호출 우선, 실패 또는 비활성 시 Template fallback.
 * PlanDraftService는 AiPlanGenerator만 의존하며, 런타임에서는 항상 정상 201 유지.
 */
@Primary
@Component
public class FallbackAiPlanGenerator implements AiPlanGenerator {

    private static final Logger log = LoggerFactory.getLogger(FallbackAiPlanGenerator.class);

    private final AiProperties properties;
    private final HttpAiPlanGenerator httpAiPlanGenerator;
    private final TemplateAiPlanGenerator templateAiPlanGenerator;

    public FallbackAiPlanGenerator(AiProperties properties,
                                   HttpAiPlanGenerator httpAiPlanGenerator,
                                   TemplateAiPlanGenerator templateAiPlanGenerator) {
        this.properties = properties;
        this.httpAiPlanGenerator = httpAiPlanGenerator;
        this.templateAiPlanGenerator = templateAiPlanGenerator;
    }

    @Override
    public InitialPlanDto generateInitialPlan(SurveyDto survey, DigitalLevel digitalLevel) {
        if (!properties.isEnabled()) {
            log.info("[AI] disabled → template used (digimon.ai.enabled=false)");
            return templateAiPlanGenerator.generateInitialPlan(survey, digitalLevel);
        }

        try {
            InitialPlanDto result = httpAiPlanGenerator.generateInitialPlan(survey, digitalLevel);
            return result;
        } catch (Exception e) {
            log.warn("[AI] fallback to template reason={}", e.getMessage());
            return templateAiPlanGenerator.generateInitialPlan(survey, digitalLevel);
        }
    }
}

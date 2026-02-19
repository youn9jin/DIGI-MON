package com.digimon.api.plandraft;

import com.digimon.api.plandraft.ai.AiPlanGenerator;
import com.digimon.api.plandraft.dto.CreatePlanDraftResponse;
import com.digimon.api.plandraft.dto.InitialPlanDto;
import com.digimon.api.plandraft.dto.SurveyDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class PlanDraftService {

    private final PlanDraftRepository planDraftRepository;
    private final AiPlanGenerator aiPlanGenerator;
    private final ObjectMapper objectMapper;

    public PlanDraftService(PlanDraftRepository planDraftRepository,
                            AiPlanGenerator aiPlanGenerator,
                            ObjectMapper objectMapper) {
        this.planDraftRepository = planDraftRepository;
        this.aiPlanGenerator = aiPlanGenerator;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public CreatePlanDraftResponse createDraft(String requestGuestKey, SurveyDto surveyDto) {
        String guestKey = (requestGuestKey != null && !requestGuestKey.isBlank())
                ? requestGuestKey.trim()
                : UUID.randomUUID().toString();

        planDraftRepository.expireActiveByGuestKey(guestKey, DraftStatus.ACTIVE, DraftStatus.EXPIRED);

        DigitalLevel digitalLevel = DigitalLevelCalculator.calculate(surveyDto);
        InitialPlanDto initialPlanDto = aiPlanGenerator.generateInitialPlan(surveyDto, digitalLevel);

        String attachToken = UUID.randomUUID().toString();
        OffsetDateTime attachTokenExpiresAt = OffsetDateTime.now().plusHours(12);

        Map<String, Object> surveyMap = surveyDtoToMap(surveyDto);
        Map<String, Object> initialPlanMap = objectMapper.convertValue(initialPlanDto, new TypeReference<Map<String, Object>>() {});

        PlanDraft draft = new PlanDraft();
        draft.setGuestKey(guestKey);
        draft.setStatus(DraftStatus.ACTIVE);
        draft.setSurvey(surveyMap);
        draft.setDigitalLevel(digitalLevel);
        draft.setInitialPlan(initialPlanMap);
        draft.setAttachToken(attachToken);
        draft.setAttachTokenExpiresAt(attachTokenExpiresAt);
        draft.setAttachTokenUsedAt(null);
        draft.setUserId(null);

        draft = planDraftRepository.save(draft);

        return new CreatePlanDraftResponse(
                draft.getGuestKey(),
                draft.getId(),
                draft.getAttachToken(),
                draft.getAttachTokenExpiresAt(),
                draft.getDigitalLevel(),
                initialPlanDto
        );
    }

    private static Map<String, Object> surveyDtoToMap(SurveyDto dto) {
        return Map.of(
                "q1MapSearchable", dto.getQ1MapSearchable().name(),
                "q2MapInfoAccurate", dto.getQ2MapInfoAccurate().name(),
                "q3MenuVisible", dto.getQ3MenuVisible().name(),
                "q4ContactChannel", dto.getQ4ContactChannel().name(),
                "q5PrimaryGoal", dto.getQ5PrimaryGoal().name()
        );
    }
}

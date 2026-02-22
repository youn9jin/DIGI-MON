package com.digimon.api.plandraft;

import com.digimon.api.ai.AiPlanGenerator;
import com.digimon.api.plandraft.dto.PlanActionDto;
import com.digimon.api.plandraft.dto.PlanDraftCreateRequest;
import com.digimon.api.plandraft.dto.PlanDraftCreateResponse;
import com.digimon.api.plandraft.dto.SurveyDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PlanDraftService {

    /** attachToken 만료 TTL(시간). 기본 6시간 */
    private static final int ATTACH_TOKEN_TTL_HOURS = 6;

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
    public PlanDraftCreateResponse createDraft(PlanDraftCreateRequest request) {
        String guestKey = (request.getGuestKey() != null && !request.getGuestKey().isBlank())
                ? request.getGuestKey().trim()
                : UUID.randomUUID().toString();

        planDraftRepository.expireActiveByGuestKey(guestKey, DraftStatus.ACTIVE, DraftStatus.EXPIRED);

        SurveyDto surveyDto = request.getSurvey();
        DigitalLevel digitalLevel = DigitalLevelCalculator.calculate(surveyDto);
        List<PlanActionDto> initialPlanList = aiPlanGenerator.generateInitialPlan(surveyDto, digitalLevel);

        String attachToken = UUID.randomUUID().toString();
        OffsetDateTime attachTokenExpiresAt = OffsetDateTime.now().plusHours(ATTACH_TOKEN_TTL_HOURS);

        Map<String, Object> surveyMap = surveyDtoToMap(surveyDto);
        List<Map<String, Object>> initialPlanStorage = initialPlanList.stream()
                .map(dto -> objectMapper.convertValue(dto, new TypeReference<Map<String, Object>>() {}))
                .collect(Collectors.toList());

        PlanDraft draft = new PlanDraft();
        draft.setGuestKey(guestKey);
        draft.setStatus(DraftStatus.ACTIVE);
        draft.setSurvey(surveyMap);
        draft.setDigitalLevel(digitalLevel);
        draft.setInitialPlan(initialPlanStorage);
        draft.setAttachToken(attachToken);
        draft.setAttachTokenExpiresAt(attachTokenExpiresAt);
        draft.setAttachTokenUsedAt(null);
        draft.setUserId(null);

        draft = planDraftRepository.save(draft);

        return new PlanDraftCreateResponse(
                draft.getGuestKey(),
                draft.getId(),
                draft.getAttachToken(),
                draft.getAttachTokenExpiresAt(),
                draft.getDigitalLevel(),
                initialPlanList
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

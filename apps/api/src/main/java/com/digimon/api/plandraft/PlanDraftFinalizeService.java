package com.digimon.api.plandraft;

import com.digimon.api.ai.HttpAiPlanGenerator;
import com.digimon.api.ai.TemplateAiPlanGenerator;
import com.digimon.api.ai.dto.AiGenerateRequest;
import com.digimon.api.ai.dto.AiOwnerProfileDto;
import com.digimon.api.ai.dto.AiStage;
import com.digimon.api.auth.FirebaseTokenService;
import com.digimon.api.auth.ForbiddenException;
import com.digimon.api.auth.UnauthorizedException;
import com.digimon.api.owner.OnboardingNotCompletedException;
import com.digimon.api.owner.OwnerProfile;
import com.digimon.api.owner.OwnerProfileRepository;
import com.digimon.api.plandraft.dto.FinalizeResponse;
import com.digimon.api.user.Role;
import com.digimon.api.user.User;
import com.digimon.api.user.UserService;
import com.google.firebase.auth.FirebaseToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class PlanDraftFinalizeService {

    private static final String LOCALE = "ko-KR";
    private static final Logger log = LoggerFactory.getLogger(PlanDraftFinalizeService.class);

    private final FirebaseTokenService firebaseTokenService;
    private final UserService userService;
    private final OwnerProfileRepository ownerProfileRepository;
    private final PlanDraftRepository planDraftRepository;
    private final HttpAiPlanGenerator httpAiPlanGenerator;
    private final TemplateAiPlanGenerator templateAiPlanGenerator;

    public PlanDraftFinalizeService(FirebaseTokenService firebaseTokenService,
                                    UserService userService,
                                    OwnerProfileRepository ownerProfileRepository,
                                    PlanDraftRepository planDraftRepository,
                                    HttpAiPlanGenerator httpAiPlanGenerator,
                                    TemplateAiPlanGenerator templateAiPlanGenerator) {
        this.firebaseTokenService = firebaseTokenService;
        this.userService = userService;
        this.ownerProfileRepository = ownerProfileRepository;
        this.planDraftRepository = planDraftRepository;
        this.httpAiPlanGenerator = httpAiPlanGenerator;
        this.templateAiPlanGenerator = templateAiPlanGenerator;
    }

    /**
     * Authorization Bearer 토큰으로 현재 사용자 확정. 실패 시 UnauthorizedException.
     */
    public User resolveCurrentUser(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new UnauthorizedException("Authentication required");
        }
        String idToken = authorization.substring("Bearer ".length()).trim();
        try {
            FirebaseToken decoded = firebaseTokenService.verify(idToken);
            return userService.getOrCreateFromFirebase(decoded);
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid or missing token");
        }
    }

    /**
     * /api/me와 동일 기준: OWNER, onboarded=true, missing empty(ownerProfile 존재).
     */
    private void validateOnboardingComplete(User user) {
        if (user.getRole() != Role.OWNER) {
            throw new OnboardingNotCompletedException();
        }
        if (!user.isOnboarded()) {
            throw new OnboardingNotCompletedException();
        }
        if (!ownerProfileRepository.existsById(user.getId())) {
            throw new OnboardingNotCompletedException();
        }
    }

    @Transactional
    public FinalizeResponse finalize(long draftId, String authorization) {
        User currentUser = resolveCurrentUser(authorization);
        validateOnboardingComplete(currentUser);

        String requestId = UUID.randomUUID().toString();
        log.info("[finalize] requestId={} draftId={} userId={}", requestId, draftId, currentUser.getId());

        PlanDraft draft = planDraftRepository.findByIdForUpdate(draftId)
                .orElseThrow(() -> new DraftNotFoundException(draftId));

        if (draft.getUserId() == null || !draft.getUserId().equals(currentUser.getId())) {
            log.warn("[finalize] forbidden draftId={} userId={} draftOwner={}", draftId, currentUser.getId(), draft.getUserId());
            throw new ForbiddenException("No permission to finalize this draft");
        }

        if (draft.getStatus() == DraftStatus.FINALIZED) {
            log.info("[finalize] idempotent draftId={} already FINALIZED", draftId);
            return toResponse(draft);
        }

        OwnerProfile profile = ownerProfileRepository.findById(currentUser.getId())
                .orElseThrow(OnboardingNotCompletedException::new);

        AiOwnerProfileDto ownerProfileDto = AiOwnerProfileDto.builder()
                .storeName(profile.getStoreName())
                .industryTag(profile.getBusinessType())
                .ageGroup(profile.getAgeGroup())
                .location(new AiOwnerProfileDto.AiLocationDto(
                        profile.getCountryCode(),
                        profile.getRegionText()))
                .build();

        AiGenerateRequest aiRequest = AiGenerateRequest.builder()
                .requestId(requestId)
                .stage(AiStage.FINALIZE)
                .locale(LOCALE)
                .digitalLevel(draft.getDigitalLevel())
                .survey(draft.getSurvey())
                .ownerProfile(ownerProfileDto)
                .initialPlan(draft.getInitialPlan())
                .build();

        Object rawFinalPlan = httpAiPlanGenerator.generateFinalPlan(aiRequest);
        Map<String, Object> finalPlan;
        if (rawFinalPlan != null && rawFinalPlan instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> map = (Map<String, Object>) rawFinalPlan;
            finalPlan = map;
            log.info("[finalize] AI success requestId={} draftId={}", requestId, draftId);
        } else {
            finalPlan = templateAiPlanGenerator.generateFinalPlanFallback();
            log.warn("[finalize] AI fallback used requestId={} draftId={} reason={}", requestId, draftId,
                    rawFinalPlan == null ? "null response" : "response not map");
        }
        if (finalPlan == null) {
            throw new IllegalStateException("finalPlan must not be null before saving FINALIZED");
        }

        OffsetDateTime now = OffsetDateTime.now();
        draft.setFinalPlan(finalPlan);
        draft.setStatus(DraftStatus.FINALIZED);
        draft.setFinalizedAt(now);
        planDraftRepository.save(draft);

        return toResponse(draft);
    }

    private static FinalizeResponse toResponse(PlanDraft draft) {
        return new FinalizeResponse(
                draft.getId(),
                DraftStatus.FINALIZED.name(),
                draft.getDigitalLevel() != null ? draft.getDigitalLevel().name() : null,
                draft.getFinalPlan(),
                draft.getFinalizedAt()
        );
    }
}

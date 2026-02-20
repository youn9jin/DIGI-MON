package com.digimon.api.plandraft;

import com.digimon.api.auth.FirebaseTokenService;
import com.digimon.api.auth.UnauthorizedException;
import com.digimon.api.plandraft.dto.AttachRequest;
import com.digimon.api.plandraft.dto.AttachResponse;
import com.digimon.api.user.User;
import com.digimon.api.user.UserService;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
public class PlanDraftAttachService {

    private final FirebaseTokenService firebaseTokenService;
    private final UserService userService;
    private final PlanDraftRepository planDraftRepository;

    public PlanDraftAttachService(FirebaseTokenService firebaseTokenService,
                                 UserService userService,
                                 PlanDraftRepository planDraftRepository) {
        this.firebaseTokenService = firebaseTokenService;
        this.userService = userService;
        this.planDraftRepository = planDraftRepository;
    }

    /**
     * Authorization Bearer 토큰으로 현재 사용자 확정. 실패 시 UnauthorizedException.
     */
    public User resolveCurrentUser(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
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
     * 원자적 UPDATE 먼저: attachDraftAtomic 호출 후 row count로 성공/실패 판정.
     * updated==0일 때만 재조회하여 404 / 200(idempotent) / 409 분기.
     * (인증·attachToken @NotBlank 검증은 controller에서 선행)
     */
    @Transactional
    public AttachResponse attach(long draftId, AttachRequest request, User currentUser) {
        OffsetDateTime now = OffsetDateTime.now();
        String token = request.getAttachToken() == null ? "" : request.getAttachToken().trim();

        int updated = planDraftRepository.attachDraftAtomic(draftId, currentUser.getId(), token, now);
        if (updated == 1) {
            return new AttachResponse(draftId, true);
        }

        // updated == 0: 재조회 후 사유 분기
        PlanDraft draft = planDraftRepository.findById(draftId)
                .orElseThrow(() -> new DraftNotFoundException(draftId));
        if (draft.getUserId() != null && draft.getUserId().equals(currentUser.getId())) {
            return new AttachResponse(draftId, true); // idempotent
        }
        if (draft.getUserId() != null) {
            throw new DraftAlreadyAttachedException();
        }
        throw new AttachTokenInvalidOrExpiredException();
    }
}

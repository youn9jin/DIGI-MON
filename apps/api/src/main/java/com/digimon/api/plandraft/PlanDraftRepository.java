package com.digimon.api.plandraft;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.Optional;

public interface PlanDraftRepository extends JpaRepository<PlanDraft, Long> {

    Optional<PlanDraft> findByGuestKeyAndStatus(String guestKey, DraftStatus status);

    @Modifying
    @Query("UPDATE PlanDraft p SET p.status = :expired WHERE p.guestKey = :guestKey AND p.status = :active")
    int expireActiveByGuestKey(
            @Param("guestKey") String guestKey,
            @Param("active") DraftStatus active,
            @Param("expired") DraftStatus expired
    );

    /**
     * 익명 draft를 현재 사용자에게 원자적으로 attach.
     * 조건: user_id IS NULL, attach_token_used_at IS NULL, 만료 전, attach_token 일치.
     * 반환: 업데이트된 row 수 (0 또는 1).
     */
    @Modifying
    @Query(value = """
            UPDATE plan_drafts
            SET user_id = :userId, attach_token_used_at = :now, updated_at = :now
            WHERE id = :draftId
              AND user_id IS NULL
              AND attach_token_used_at IS NULL
              AND attach_token_expires_at > :now
              AND attach_token = :attachToken
            """, nativeQuery = true)
    int attachDraftAtomic(
            @Param("draftId") long draftId,
            @Param("userId") long userId,
            @Param("attachToken") String attachToken,
            @Param("now") OffsetDateTime now
    );
}

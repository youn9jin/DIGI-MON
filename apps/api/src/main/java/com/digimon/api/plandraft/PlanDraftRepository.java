package com.digimon.api.plandraft;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
}

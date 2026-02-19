package com.digimon.api.plandraft;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.Map;

@Entity
@Table(name = "plan_drafts")
@Getter
@Setter
@NoArgsConstructor
public class PlanDraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "guest_key", nullable = false)
    private String guestKey;

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status", nullable = false, columnDefinition = "plan_draft_status")
    private DraftStatus status;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "survey", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> survey;

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "digital_level", nullable = false, columnDefinition = "digital_level")
    private DigitalLevel digitalLevel;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "initial_plan", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> initialPlan;

    @Column(name = "attach_token", nullable = false)
    private String attachToken;

    @Column(name = "attach_token_expires_at", nullable = false)
    private OffsetDateTime attachTokenExpiresAt;

    @Column(name = "attach_token_used_at")
    private OffsetDateTime attachTokenUsedAt;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    void prePersist() {
        OffsetDateTime now = OffsetDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}

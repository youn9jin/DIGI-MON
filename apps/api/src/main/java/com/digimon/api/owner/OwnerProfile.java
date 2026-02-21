package com.digimon.api.owner;

import com.digimon.api.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "owner_profiles")
@Getter
@Setter
@NoArgsConstructor
public class OwnerProfile {

    @Id
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "store_name")
    private String storeName;

    /** 업종. 저장/조회의 source of truth. */
    @Column(name = "industry_tag")
    private String industryTag;

    /** 레거시/임시. 업종 저장에는 사용하지 않음. 조회 fallback용만 유지. */
    @Column(name = "business_type")
    private String businessType;

    @Column(name = "region_text")
    private String regionText;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "opened_at")
    private LocalDate openedAt;

    @Column(name = "age_group", nullable = false)
    private String ageGroup;

    @Column(name = "country_code", nullable = false, columnDefinition = "bpchar(2)")
    private String countryCode;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    /**
     * 응답/조회 시 사용. industry_tag가 있으면 사용, null이면 레거시 business_type fallback.
     * 저장 시에는 항상 industry_tag만 사용한다.
     */
    public static String resolveIndustryTag(OwnerProfile profile) {
        if (profile == null) return null;
        return profile.getIndustryTag() != null ? profile.getIndustryTag() : profile.getBusinessType();
    }
}

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
}

package com.digimon.api.helper;

import com.digimon.api.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Entity
@Table(name = "helper_profiles")
@Getter
@NoArgsConstructor
public class HelperProfile {

    @Id
    private Long userId;   // users.id (bigint)

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String nickname;

    private String regionText;

    private String availableTime;

    @Column(columnDefinition = "text")
    private String intro;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}

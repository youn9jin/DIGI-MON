package com.digimon.api.owner;

import com.digimon.api.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Entity
@Table(name = "owner_profiles")
@Getter
@NoArgsConstructor
public class OwnerProfile {

    @Id
    private Long userId;   // users.id (bigint)

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}

package com.digimon.api.user;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String firebaseUid;

    private String email;

    private String name;

    @Enumerated(EnumType.STRING)
    private Role role;   // OWNER / HELPER / null 가능

    private boolean onboarded = false;

    private LocalDateTime createdAt = LocalDateTime.now();
}

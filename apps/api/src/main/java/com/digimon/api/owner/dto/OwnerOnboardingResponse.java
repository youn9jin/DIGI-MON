package com.digimon.api.owner.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class OwnerOnboardingResponse {

    private long userId;
    private String role;
    private boolean onboarded;
    private OwnerProfileResponse ownerProfile;
}

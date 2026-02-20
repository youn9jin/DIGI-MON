package com.digimon.api.owner.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 서비스 내부용: created 여부 + 응답 DTO */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class OwnerOnboardingResult {

    private boolean created;
    private OwnerOnboardingResponse response;
}

package com.digimon.api.plandraft.dto;

import com.digimon.api.plandraft.DigitalLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CreatePlanDraftResponse {
    private String guestKey;
    private Long draftId;
    private String attachToken;
    private OffsetDateTime attachTokenExpiresAt;
    private DigitalLevel digitalLevel;
    private InitialPlanDto initialPlan;
}

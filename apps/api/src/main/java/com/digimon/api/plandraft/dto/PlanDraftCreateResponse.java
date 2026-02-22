package com.digimon.api.plandraft.dto;

import com.digimon.api.plandraft.DigitalLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PlanDraftCreateResponse {

    private String guestKey;
    private Long draftId;
    private String attachToken;
    private OffsetDateTime attachTokenExpiresAt;
    private DigitalLevel digitalLevel;
    private List<PlanActionDto> initialPlan;
}

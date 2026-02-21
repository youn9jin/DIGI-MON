package com.digimon.api.plandraft.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FinalizeResponse {

    private Long draftId;
    private String status; // "FINALIZED"
    private String digitalLevel; // DB 값 그대로, e.g. LEVEL2
    private Map<String, Object> finalPlan;
    private OffsetDateTime finalizedAt;
}

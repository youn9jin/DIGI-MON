package com.digimon.api.plandraft;

import com.digimon.api.global.ResponseWrapper;
import com.digimon.api.plandraft.dto.FinalizeResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class PlanDraftFinalizeController {

    private final PlanDraftFinalizeService planDraftFinalizeService;

    public PlanDraftFinalizeController(PlanDraftFinalizeService planDraftFinalizeService) {
        this.planDraftFinalizeService = planDraftFinalizeService;
    }

    /**
     * POST /api/plan-drafts/{draftId}/finalize
     * Auth: Bearer (Firebase ID Token), Role: OWNER.
     * Body: optional {}.
     */
    @PostMapping("/plan-drafts/{draftId}/finalize")
    public ResponseEntity<ResponseWrapper<FinalizeResponse>> finalize(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable long draftId) {
        FinalizeResponse data = planDraftFinalizeService.finalize(draftId, authorization);
        return ResponseEntity.ok(ResponseWrapper.success(data));
    }
}

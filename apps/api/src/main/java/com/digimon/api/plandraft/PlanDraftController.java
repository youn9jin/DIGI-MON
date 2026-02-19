package com.digimon.api.plandraft;

import com.digimon.api.global.ResponseWrapper;
import com.digimon.api.plandraft.dto.CreatePlanDraftRequest;
import com.digimon.api.plandraft.dto.CreatePlanDraftResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class PlanDraftController {

    private final PlanDraftService planDraftService;

    public PlanDraftController(PlanDraftService planDraftService) {
        this.planDraftService = planDraftService;
    }

    @PostMapping("/plan-drafts")
    public ResponseEntity<ResponseWrapper<CreatePlanDraftResponse>> createPlanDraft(
            @Valid @RequestBody CreatePlanDraftRequest request) {
        CreatePlanDraftResponse data = planDraftService.createDraft(request.getGuestKey(), request.getSurvey());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ResponseWrapper.success(data));
    }
}

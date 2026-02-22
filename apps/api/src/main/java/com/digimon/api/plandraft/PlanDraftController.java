package com.digimon.api.plandraft;

import com.digimon.api.global.ResponseWrapper;
import com.digimon.api.plandraft.dto.AttachRequest;
import com.digimon.api.plandraft.dto.AttachResponse;
import com.digimon.api.plandraft.dto.PlanDraftCreateRequest;
import com.digimon.api.plandraft.dto.PlanDraftCreateResponse;
import com.digimon.api.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class PlanDraftController {

    private final PlanDraftService planDraftService;
    private final PlanDraftAttachService planDraftAttachService;

    public PlanDraftController(PlanDraftService planDraftService,
                               PlanDraftAttachService planDraftAttachService) {
        this.planDraftService = planDraftService;
        this.planDraftAttachService = planDraftAttachService;
    }

    @PostMapping("/plan-drafts")
    public ResponseEntity<ResponseWrapper<PlanDraftCreateResponse>> createPlanDraft(
            @Valid @RequestBody PlanDraftCreateRequest request) {
        PlanDraftCreateResponse data = planDraftService.createDraft(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ResponseWrapper.success(data));
    }

    @PostMapping("/plan-drafts/{draftId}/attach")
    public ResponseEntity<ResponseWrapper<AttachResponse>> attachDraft(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable long draftId,
            @Valid @RequestBody AttachRequest request) {
        User currentUser = planDraftAttachService.resolveCurrentUser(authorization);
        AttachResponse data = planDraftAttachService.attach(draftId, request, currentUser);
        return ResponseEntity.ok(ResponseWrapper.success(data));
    }
}

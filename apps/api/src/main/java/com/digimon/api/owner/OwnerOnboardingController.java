package com.digimon.api.owner;

import com.digimon.api.global.ResponseWrapper;
import com.digimon.api.owner.dto.OwnerOnboardingRequest;
import com.digimon.api.owner.dto.OwnerOnboardingResponse;
import com.digimon.api.owner.dto.OwnerOnboardingResult;
import com.digimon.api.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class OwnerOnboardingController {

    private final OwnerOnboardingService ownerOnboardingService;

    public OwnerOnboardingController(OwnerOnboardingService ownerOnboardingService) {
        this.ownerOnboardingService = ownerOnboardingService;
    }

    @PostMapping("/owners/onboarding")
    public ResponseEntity<ResponseWrapper<OwnerOnboardingResponse>> onboardOwner(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody OwnerOnboardingRequest request) {
        User currentUser = ownerOnboardingService.resolveCurrentUser(authorization);
        OwnerOnboardingResult result = ownerOnboardingService.onboardOwner(currentUser, request);
        return ResponseEntity
                .status(result.isCreated() ? HttpStatus.CREATED : HttpStatus.OK)
                .body(ResponseWrapper.success(result.getResponse()));
    }
}

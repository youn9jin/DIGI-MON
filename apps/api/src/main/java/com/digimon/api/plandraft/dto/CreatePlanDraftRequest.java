package com.digimon.api.plandraft.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreatePlanDraftRequest {

    @Size(min = 1, message = "guestKey must not be blank when provided")
    private String guestKey;

    @NotNull(message = "survey is required")
    @Valid
    private SurveyDto survey;
}

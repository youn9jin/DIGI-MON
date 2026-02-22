package com.digimon.api.plandraft.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlanStepDto {

    @JsonProperty("step_title")
    private String stepTitle;

    private String description;
}

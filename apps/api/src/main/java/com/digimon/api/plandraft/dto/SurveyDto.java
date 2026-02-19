package com.digimon.api.plandraft.dto;

import com.digimon.api.plandraft.survey.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SurveyDto {

    @NotNull(message = "survey.q1MapSearchable is required")
    private Q1MapSearchable q1MapSearchable;

    @NotNull(message = "survey.q2MapInfoAccurate is required")
    private Q2MapInfoAccurate q2MapInfoAccurate;

    @NotNull(message = "survey.q3MenuVisible is required")
    private Q3MenuVisible q3MenuVisible;

    @NotNull(message = "survey.q4ContactChannel is required")
    private Q4ContactChannel q4ContactChannel;

    @NotNull(message = "survey.q5PrimaryGoal is required")
    private Q5PrimaryGoal q5PrimaryGoal;
}

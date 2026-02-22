package com.digimon.api.plandraft.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlanActionDto {

    private String actionCode;
    private String title;
    private String summary;
    private Integer estimatedMinutes;
    private List<PlanStepDto> steps;
}

package com.digimon.api.plandraft.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PrimaryActionDto {
    private String actionCode;
    private String title;
    private String summary;
    private Integer estimatedMinutes;
}

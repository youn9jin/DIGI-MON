package com.digimon.api.owner.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class OwnerProfileResponse {

    private String storeName;
    private String industryTag;
    private String ageGroup;
    private LocationResponse location;
    private LocalDate openedAt;
}

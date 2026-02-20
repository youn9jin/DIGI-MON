package com.digimon.api.owner.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OwnerOnboardingRequest {

    @NotBlank(message = "industryTag must not be blank")
    private String industryTag;

    @NotBlank(message = "ageGroup must not be blank")
    private String ageGroup;

    @NotBlank(message = "storeName must not be blank")
    private String storeName;

    @NotNull(message = "location is required")
    @Valid
    private LocationRequest location;

    /** optional; 미전송 시 null. 미래 날짜면 서비스에서 400 */
    private LocalDate openedAt;
}

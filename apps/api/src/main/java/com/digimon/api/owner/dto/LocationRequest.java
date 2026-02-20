package com.digimon.api.owner.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LocationRequest {

    @NotBlank(message = "countryCode must not be blank")
    @Pattern(regexp = "^[A-Z]{2}$", message = "countryCode must be 2 uppercase letters (ISO alpha-2)")
    private String countryCode;

    @NotBlank(message = "adminArea must not be blank")
    private String adminArea;
}

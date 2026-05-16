package com.digimon.api.associations.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * POST /api/associations/onboarding 요청 바디.
 *
 * mainCategories 원소 화이트리스트(농수산물/먹거리/의류/생활용품/기타)는
 * Bean Validation 으로 표현하기 까다로워 AssociationsService 에서 직접 검증한다.
 */
@Getter
@Setter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OnboardingRequest {

    @NotBlank(message = "name is required")
    @Size(min = 1, max = 100, message = "name length must be between 1 and 100")
    private String name;

    @NotBlank(message = "address is required")
    @Size(min = 1, max = 255, message = "address length must be between 1 and 255")
    private String address;

    @NotBlank(message = "marketType is required")
    @Pattern(
            regexp = "^(TRADITIONAL|COMMERCIAL|COMPLEX)$",
            message = "marketType must be one of TRADITIONAL/COMMERCIAL/COMPLEX")
    private String marketType;

    @NotEmpty(message = "mainCategories must contain at least 1 item")
    private String[] mainCategories;

    @NotBlank(message = "totalStores is required")
    @Pattern(
            regexp = "^(UNDER_10|TEN_TO_30|THIRTY_TO_50|OVER_50)$",
            message = "totalStores must be one of UNDER_10/TEN_TO_30/THIRTY_TO_50/OVER_50")
    private String totalStores;

    @NotNull(message = "operatingHours is required")
    @Valid
    private OperatingHours operatingHours;

    @NotBlank(message = "targetCustomers is required")
    @Size(min = 1, max = 500, message = "targetCustomers length must be between 1 and 500")
    private String targetCustomers;

    @Pattern(regexp = "^[0-9+\\-() ]{5,20}$", message = "contact format invalid")
    private String contact;

    @Size(max = 50, message = "description length must be at most 50")
    private String description;

    @Size(min = 1, max = 50, message = "managerName length must be between 1 and 50")
    private String managerName;

    @Size(min = 1, max = 50, message = "managerTitle length must be between 1 and 50")
    private String managerTitle;
}

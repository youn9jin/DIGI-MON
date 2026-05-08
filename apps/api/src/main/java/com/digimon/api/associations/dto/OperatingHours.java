package com.digimon.api.associations.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * POST /api/associations/onboarding 요청의 operatingHours 중첩 DTO.
 * Market.operating_hours (varchar(255)) 컬럼에 JSON 문자열로 직렬화 저장된다.
 */
@Getter
@Setter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OperatingHours {

    @NotBlank(message = "weekday is required")
    @Size(min = 1, max = 50, message = "weekday length must be between 1 and 50")
    private String weekday;

    @Size(min = 1, max = 50, message = "weekend length must be between 1 and 50")
    private String weekend;
}

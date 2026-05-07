package com.digimon.api.user.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * PATCH /api/me 요청 바디.
 * 모든 필드는 optional. null이면 미변경(partial update).
 *
 * 향후 프로필 필드 확장 시:
 * 1) 여기에 nullable 필드 + 적절한 Bean Validation 추가.
 * 2) UserService#updateProfile 에서 null-check 후 setter 호출 한 줄 추가.
 * (응답 형태는 MeController#buildMeResponse 가 단일 진실 소스)
 */
@Getter
@Setter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UpdateMeRequest {

    @Size(min = 1, max = 50, message = "name length must be between 1 and 50")
    private String name;

    @Pattern(regexp = "^[0-9+\\-() ]{5,20}$", message = "phone format invalid")
    private String phone;
}

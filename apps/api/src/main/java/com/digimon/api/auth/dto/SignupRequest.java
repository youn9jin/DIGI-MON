package com.digimon.api.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** @deprecated 회원가입은 Firebase 처리. 현재 미사용. 삭제 시 별도 PR 권장. */
@Deprecated
@Getter
@Setter
@NoArgsConstructor
public class SignupRequest {

    @NotBlank(message = "email is required")
    @Email
    private String email;

    @NotBlank(message = "password is required")
    @Size(min = 8)
    private String password;

    private String name;

    private String phone;
}

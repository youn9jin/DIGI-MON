package com.digimon.api.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/** @deprecated 회원가입은 Firebase 처리. 현재 미사용. 삭제 시 별도 PR 권장. */
@Deprecated
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SignupResponse {

    private Long id;
    private String email;
    private String name;
    private String phone;
    private String provider;
    private Object role;
    private boolean onboarded;
    private List<String> missing;
}

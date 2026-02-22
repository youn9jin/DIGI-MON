package com.digimon.api.auth;

/**
 * 이메일이 이미 다른 Firebase 계정(uid)에 연결된 경우.
 * /api/me 등에서 409 Conflict 반환용.
 */
public class AuthAccountConflictException extends RuntimeException {

    public AuthAccountConflictException(String message) {
        super(message);
    }
}

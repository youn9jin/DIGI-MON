package com.digimon.api.associations;

/**
 * 이미 market 이 등록된 유저가 다시 온보딩을 시도한 경우.
 * POST /api/associations/onboarding 에서 409 Conflict 반환용.
 */
public class AlreadyOnboardedException extends RuntimeException {

    public AlreadyOnboardedException(String message) {
        super(message);
    }
}

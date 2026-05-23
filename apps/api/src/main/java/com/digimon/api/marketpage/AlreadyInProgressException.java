package com.digimon.api.marketpage;

/**
 * 동일 market 의 page row 가 이미 PENDING 상태일 때 (생성 중복 요청).
 * GlobalExceptionHandler 에서 400 BAD_REQUEST + code "ALREADY_IN_PROGRESS" 로 매핑.
 */
public class AlreadyInProgressException extends RuntimeException {

    public AlreadyInProgressException(String message) {
        super(message);
    }
}

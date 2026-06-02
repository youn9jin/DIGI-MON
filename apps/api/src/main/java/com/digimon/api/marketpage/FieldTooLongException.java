package com.digimon.api.marketpage;

/**
 * PATCH /api/market/page/text 요청 필드가 글자 수 제한을 초과했을 때 사용.
 * GlobalExceptionHandler 에서 400 BAD_REQUEST + code "FIELD_TOO_LONG" 으로 매핑한다.
 */
public class FieldTooLongException extends RuntimeException {

    public FieldTooLongException(String message) {
        super(message);
    }
}

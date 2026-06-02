package com.digimon.api.marketpage;

/**
 * PATCH /api/market/page/text 요청의 모든 필드가 null 일 때 사용.
 * GlobalExceptionHandler 에서 400 BAD_REQUEST + code "NO_FIELDS_TO_UPDATE" 로 매핑한다.
 */
public class NoFieldsToUpdateException extends RuntimeException {

    public NoFieldsToUpdateException(String message) {
        super(message);
    }
}

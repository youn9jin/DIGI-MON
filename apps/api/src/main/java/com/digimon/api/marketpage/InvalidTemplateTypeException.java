package com.digimon.api.marketpage;

/**
 * templateType 이 TEMPLATE_1 / TEMPLATE_2 / TEMPLATE_3 외의 값일 때.
 * GlobalExceptionHandler 에서 400 BAD_REQUEST + code "INVALID_TEMPLATE_TYPE" 로 매핑.
 */
public class InvalidTemplateTypeException extends RuntimeException {

    public InvalidTemplateTypeException(String message) {
        super(message);
    }
}

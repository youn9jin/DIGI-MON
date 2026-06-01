package com.digimon.api.marketpage;

/**
 * selectedSections 요소 중 허용값(intro/history/directions/stores/tourism) 외의 값이 있을 때.
 * GlobalExceptionHandler 에서 400 BAD_REQUEST + code "INVALID_SECTION_VALUE" 로 매핑.
 */
public class InvalidSectionValueException extends RuntimeException {

    public InvalidSectionValueException(String message) {
        super(message);
    }
}

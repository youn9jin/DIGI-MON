package com.digimon.api.marketpage;

/**
 * selectedSections 가 null 또는 빈 배열일 때.
 * GlobalExceptionHandler 에서 400 BAD_REQUEST + code "NO_SECTIONS_SELECTED" 로 매핑.
 */
public class NoSectionsSelectedException extends RuntimeException {

    public NoSectionsSelectedException(String message) {
        super(message);
    }
}

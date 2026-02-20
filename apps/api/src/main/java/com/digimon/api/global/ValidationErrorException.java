package com.digimon.api.global;

import java.util.List;

/** 서비스 단 custom validation 실패 시 400 VALIDATION_ERROR 반환용 */
public class ValidationErrorException extends RuntimeException {

    private final List<ValidationErrorDetail> details;

    public ValidationErrorException(List<ValidationErrorDetail> details) {
        super("Validation failed");
        this.details = details != null ? details : List.of();
    }

    public List<ValidationErrorDetail> getDetails() {
        return details;
    }
}

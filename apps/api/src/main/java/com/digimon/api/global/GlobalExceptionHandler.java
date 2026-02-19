package com.digimon.api.global;

import com.digimon.api.auth.EmailAlreadyExistsException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleEmailAlreadyExists() {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", "EMAIL_ALREADY_EXISTS"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseWrapper<Void>> handleValidation(MethodArgumentNotValidException ex) {
        List<ValidationErrorDetail> details = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> new ValidationErrorDetail(
                        e.getField(),
                        e.getDefaultMessage() != null ? e.getDefaultMessage() : "invalid"))
                .collect(Collectors.toList());
        ResponseWrapper<Void> body = ResponseWrapper.error(
                "VALIDATION_ERROR",
                "Invalid request body",
                details);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ResponseWrapper<Void>> handleMessageNotReadable(HttpMessageNotReadableException ex) {
        String reason = ex.getMessage() != null && ex.getMessage().length() > 200
                ? "Invalid JSON or enum value"
                : ex.getMessage();
        List<ValidationErrorDetail> details = List.of(new ValidationErrorDetail("request", reason));
        ResponseWrapper<Void> body = ResponseWrapper.error(
                "VALIDATION_ERROR",
                "Invalid request body",
                details);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseWrapper<Void>> handleException(Exception ex) {
        ResponseWrapper<Void> body = ResponseWrapper.error(
                "INTERNAL_SERVER_ERROR",
                "Unexpected error occurred",
                null);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}

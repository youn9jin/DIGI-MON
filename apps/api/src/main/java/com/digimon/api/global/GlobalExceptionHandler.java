package com.digimon.api.global;

import com.digimon.api.auth.AuthAccountConflictException;
import com.digimon.api.auth.ForbiddenException;
import com.digimon.api.auth.UnauthorizedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AuthAccountConflictException.class)
    public ResponseEntity<ResponseWrapper<Void>> handleAuthAccountConflict(AuthAccountConflictException ex) {
        ResponseWrapper<Void> body = ResponseWrapper.error(
                "AUTH_ACCOUNT_CONFLICT",
                ex.getMessage() != null ? ex.getMessage() : "Email already linked to another account",
                null);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ResponseWrapper<Void>> handleUnauthorized(UnauthorizedException ex) {
        ResponseWrapper<Void> body = ResponseWrapper.error(
                "UNAUTHORIZED",
                ex.getMessage() != null ? ex.getMessage() : "Invalid or missing token",
                null);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ResponseWrapper<Void>> handleForbidden(ForbiddenException ex) {
        ResponseWrapper<Void> body = ResponseWrapper.error(
                "FORBIDDEN",
                ex.getMessage() != null ? ex.getMessage() : "Forbidden",
                null);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(ValidationErrorException.class)
    public ResponseEntity<ResponseWrapper<Void>> handleValidationError(ValidationErrorException ex) {
        ResponseWrapper<Void> body = ResponseWrapper.error(
                "VALIDATION_ERROR",
                "Invalid request body",
                ex.getDetails());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
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

package com.digimon.api.global;

import com.digimon.api.auth.EmailAlreadyExistsException;
import com.digimon.api.auth.UnauthorizedException;
import com.digimon.api.plandraft.AttachTokenInvalidOrExpiredException;
import com.digimon.api.plandraft.DraftAlreadyAttachedException;
import com.digimon.api.plandraft.DraftNotFoundException;
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

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ResponseWrapper<Void>> handleUnauthorized(UnauthorizedException ex) {
        ResponseWrapper<Void> body = ResponseWrapper.error(
                "UNAUTHORIZED",
                ex.getMessage() != null ? ex.getMessage() : "Invalid or missing token",
                null);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    @ExceptionHandler(DraftNotFoundException.class)
    public ResponseEntity<ResponseWrapper<Void>> handleDraftNotFound() {
        ResponseWrapper<Void> body = ResponseWrapper.error(
                "DRAFT_NOT_FOUND",
                "Plan draft not found",
                null);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(AttachTokenInvalidOrExpiredException.class)
    public ResponseEntity<ResponseWrapper<Void>> handleAttachTokenInvalid() {
        ResponseWrapper<Void> body = ResponseWrapper.error(
                "ATTACH_TOKEN_INVALID_OR_EXPIRED",
                "Attach token is invalid, expired, or already used",
                null);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(DraftAlreadyAttachedException.class)
    public ResponseEntity<ResponseWrapper<Void>> handleDraftAlreadyAttached() {
        ResponseWrapper<Void> body = ResponseWrapper.error(
                "DRAFT_ALREADY_ATTACHED",
                "Draft is already attached to another user",
                null);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
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

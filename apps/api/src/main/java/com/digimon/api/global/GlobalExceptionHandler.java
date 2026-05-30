package com.digimon.api.global;

import com.digimon.api.associations.AlreadyOnboardedException;
import com.digimon.api.auth.AuthAccountConflictException;
import com.digimon.api.auth.ForbiddenException;
import com.digimon.api.auth.UnauthorizedException;
import com.digimon.api.marketpage.AlreadyInProgressException;
import com.digimon.api.marketpage.InvalidSectionValueException;
import com.digimon.api.marketpage.InvalidTemplateTypeException;
import com.digimon.api.marketpage.MarketPageMarketNotFoundException;
import com.digimon.api.marketpage.NoSectionsSelectedException;
import com.digimon.api.marketpage.SetupNotCompletedException;
import com.digimon.api.store.MarketNotFoundException;
import com.digimon.api.store.StoreNotFoundException;
import com.digimon.api.store.TooManyStoresException;
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

    @ExceptionHandler(AlreadyOnboardedException.class)
    public ResponseEntity<ResponseWrapper<Void>> handleAlreadyOnboarded(AlreadyOnboardedException ex) {
        ResponseWrapper<Void> body = ResponseWrapper.error(
                "ALREADY_ONBOARDED",
                ex.getMessage() != null ? ex.getMessage() : "이미 온보딩이 완료된 계정입니다.",
                null);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(MarketNotFoundException.class)
    public ResponseEntity<ResponseWrapper<Void>> handleMarketNotFound(MarketNotFoundException ex) {
        ResponseWrapper<Void> body = ResponseWrapper.error(
                "MARKET_NOT_FOUND",
                ex.getMessage() != null ? ex.getMessage() : "등록된 시장이 없습니다.",
                null);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    /**
     * POST /api/market/page 의 MARKET_NOT_FOUND. 같은 code 지만 status 가 다르므로
     * 별도 예외 클래스로 분리되어 있다(Q1-B).
     */
    @ExceptionHandler(MarketPageMarketNotFoundException.class)
    public ResponseEntity<ResponseWrapper<Void>> handleMarketPageMarketNotFound(MarketPageMarketNotFoundException ex) {
        ResponseWrapper<Void> body = ResponseWrapper.error(
                "MARKET_NOT_FOUND",
                ex.getMessage() != null ? ex.getMessage() : "등록된 시장이 없습니다.",
                null);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(InvalidTemplateTypeException.class)
    public ResponseEntity<ResponseWrapper<Void>> handleInvalidTemplateType(InvalidTemplateTypeException ex) {
        ResponseWrapper<Void> body = ResponseWrapper.error(
                "INVALID_TEMPLATE_TYPE",
                ex.getMessage() != null ? ex.getMessage() : "templateType 은 TEMPLATE_1, TEMPLATE_2, TEMPLATE_3 중 하나여야 합니다.",
                null);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(AlreadyInProgressException.class)
    public ResponseEntity<ResponseWrapper<Void>> handleAlreadyInProgress(AlreadyInProgressException ex) {
        ResponseWrapper<Void> body = ResponseWrapper.error(
                "ALREADY_IN_PROGRESS",
                ex.getMessage() != null ? ex.getMessage() : "이미 생성 중인 페이지가 있습니다.",
                null);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(NoSectionsSelectedException.class)
    public ResponseEntity<ResponseWrapper<Void>> handleNoSectionsSelected(NoSectionsSelectedException ex) {
        ResponseWrapper<Void> body = ResponseWrapper.error(
                "NO_SECTIONS_SELECTED",
                ex.getMessage() != null ? ex.getMessage() : "선택된 섹션이 없습니다.",
                null);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(InvalidSectionValueException.class)
    public ResponseEntity<ResponseWrapper<Void>> handleInvalidSectionValue(InvalidSectionValueException ex) {
        ResponseWrapper<Void> body = ResponseWrapper.error(
                "INVALID_SECTION_VALUE",
                ex.getMessage() != null ? ex.getMessage() : "허용되지 않은 섹션 값입니다.",
                null);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(SetupNotCompletedException.class)
    public ResponseEntity<ResponseWrapper<Void>> handleSetupNotCompleted(SetupNotCompletedException ex) {
        ResponseWrapper<Void> body = ResponseWrapper.error(
                "SETUP_NOT_COMPLETED",
                ex.getMessage() != null ? ex.getMessage() : "페이지 생성 설정이 완료되지 않았습니다.",
                null);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(StoreNotFoundException.class)
    public ResponseEntity<ResponseWrapper<Void>> handleStoreNotFound(StoreNotFoundException ex) {
        ResponseWrapper<Void> body = ResponseWrapper.error(
                "STORE_NOT_FOUND",
                ex.getMessage() != null ? ex.getMessage() : "해당 점포를 찾을 수 없습니다.",
                null);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(TooManyStoresException.class)
    public ResponseEntity<ResponseWrapper<Void>> handleTooManyStores(TooManyStoresException ex) {
        ResponseWrapper<Void> body = ResponseWrapper.error(
                "TOO_MANY_STORES",
                ex.getMessage() != null ? ex.getMessage() : "점포 수가 한도를 초과했습니다.",
                null);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
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

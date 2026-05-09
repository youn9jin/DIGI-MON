package com.digimon.api.store;

import com.digimon.api.auth.FirebaseTokenService;
import com.digimon.api.store.dto.CreateStoresRequest;
import com.digimon.api.user.User;
import com.digimon.api.user.UserService;
import com.google.firebase.auth.FirebaseToken;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * 점포(Store) 일괄 등록 엔드포인트.
 * 인증/응답 패턴은 MeController, AssociationsController 와 동일하게 유지한다.
 *
 * 부분 성공 정책:
 * - 한 점포의 검증 실패가 다른 점포 INSERT 를 막지 않는다.
 * - 응답은 항상 200 OK (개별 실패 항목은 failedItems 에 담겨 반환).
 * - 단, market 미존재(409) / 점포 수 한도 초과(400) 는 전체 차단으로 GlobalExceptionHandler 가 처리.
 */
@RestController
@RequestMapping("/api")
public class StoresController {

    private final FirebaseTokenService firebaseTokenService;
    private final UserService userService;
    private final StoresService storesService;

    public StoresController(FirebaseTokenService firebaseTokenService,
                            UserService userService,
                            StoresService storesService) {
        this.firebaseTokenService = firebaseTokenService;
        this.userService = userService;
        this.storesService = storesService;
    }

    @PostMapping("/stores")
    public ResponseEntity<?> createStores(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody CreateStoresRequest request) {
        return withAuthenticatedUser(authorization, user -> {
            StoresService.Result result = storesService.createStores(user, request);
            return ResponseEntity.ok(buildResponse(result));
        });
    }

    /**
     * Authorization Bearer 토큰을 검증하고 User 를 로드한 뒤 핸들러를 실행한다.
     * try 범위는 토큰 검증으로만 한정. 그 외 예외(MarketNotFoundException, TooManyStoresException, DB 오류 등)는
     * 그대로 propagate 되어 GlobalExceptionHandler 가 적절한 status 로 처리한다.
     */
    private ResponseEntity<?> withAuthenticatedUser(String authorization,
                                                    Function<User, ResponseEntity<?>> handler) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message", "Missing or invalid Authorization header. Use: Bearer <ID_TOKEN>"
            ));
        }

        String idToken = authorization.substring("Bearer ".length()).trim();

        FirebaseToken decoded;
        try {
            decoded = firebaseTokenService.verify(idToken);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message", "Invalid ID token",
                    "error", e.getMessage()
            ));
        }

        User user = userService.getOrCreateFromFirebase(decoded);
        return handler.apply(user);
    }

    /** 응답 키 순서(successCount → failedCount → successStoreIds → failedItems → message)를 LinkedHashMap 으로 보장. */
    private Map<String, Object> buildResponse(StoresService.Result result) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("successCount", result.getSuccessCount());
        body.put("failedCount", result.getFailedCount());
        body.put("successStoreIds", result.getSuccessStoreIds());
        body.put("failedItems", result.getFailedItems());
        body.put("message", result.getTotalCount() + "개 중 " + result.getSuccessCount() + "개가 등록되었습니다.");
        return body;
    }
}

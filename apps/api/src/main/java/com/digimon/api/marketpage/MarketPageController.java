package com.digimon.api.marketpage;

import com.digimon.api.auth.FirebaseTokenService;
import com.digimon.api.global.ResponseWrapper;
import com.digimon.api.marketpage.dto.MarketPageContentResponse;
import com.digimon.api.user.User;
import com.digimon.api.user.UserService;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * 시장 페이지(market_pages) 엔드포인트.
 * 인증/응답 패턴은 StoresController, MeController 와 동일하게 유지한다.
 *
 * 엔드포인트:
 * - POST /api/market/page : 비동기 페이지 생성 트리거. 즉시 202 + pageId 반환.
 * - GET  /api/market/page/status/{pageId} : SSE 구독. 생성 완료/실패 시 done/failed 이벤트 push.
 *
 * 401 정책: Authorization 헤더(또는 token 쿼리 파라미터) 없거나 토큰 검증 실패 시 raw Map 반환 (기존 패턴 동일).
 *           나머지 도메인 예외는 GlobalExceptionHandler 가 ResponseWrapper.error 로 매핑.
 */
@RestController
@RequestMapping("/api")
public class MarketPageController {

    private final FirebaseTokenService firebaseTokenService;
    private final UserService userService;
    private final MarketPageService marketPageService;

    public MarketPageController(FirebaseTokenService firebaseTokenService,
                                UserService userService,
                                MarketPageService marketPageService) {
        this.firebaseTokenService = firebaseTokenService;
        this.userService = userService;
        this.marketPageService = marketPageService;
    }

    @PostMapping("/market/page")
    public ResponseEntity<?> createMarketPage(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return withAuthenticatedUser(authorization, user -> {
            Long pageId = marketPageService.startGeneration(user);
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("pageId", pageId);
            data.put("status", "PENDING");
            data.put("message", "웹페이지 생성이 시작되었습니다.");
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(ResponseWrapper.success(data));
        });
    }

    @GetMapping("/market/page/{pageId}")
    public ResponseEntity<?> getMarketPageContent(@PathVariable Long pageId,
                                                  @RequestHeader(value = "Authorization", required = false)
                                                  String authorization) {
        return withAuthenticatedUser(authorization, user -> {
            MarketPageContentResponse content = marketPageService.getPageContent(pageId, user.getId());
            return ResponseEntity.ok(ResponseWrapper.success(content));
        });
    }

    /**
     * SSE 구독. EventSource 는 커스텀 헤더를 못 보내므로 ID 토큰을 token 쿼리 파라미터로 받는다.
     *
     * 반환 타입이 Object 인 이유: 401 은 기존 패턴과 동일하게 raw Map(ResponseEntity)으로 주고,
     * 정상 흐름은 SseEmitter 를 반환해야 한다(Spring 이 SseEmitter 를 보고 자동으로 text/event-stream 세팅).
     * produces 를 명시하지 않는다 — 명시하면 401 의 Map 응답이 event-stream 으로 직렬화되려다 깨진다.
     * 404(PAGE_NOT_FOUND)/403(FORBIDDEN) 은 connectStatus 가 던지는 예외를 GlobalExceptionHandler 가 처리.
     */
    @GetMapping("/market/page/status/{pageId}")
    public Object getPageStatus(@PathVariable Long pageId,
                                @RequestParam(value = "token", required = false) String token) {
        if (token == null || token.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message", "Missing token query parameter"
            ));
        }

        FirebaseToken decoded;
        try {
            decoded = firebaseTokenService.verify(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message", "Invalid ID token",
                    "error", e.getMessage()
            ));
        }

        User user = userService.getOrCreateFromFirebase(decoded);
        return marketPageService.connectStatus(pageId, user.getId());
    }

    /**
     * Authorization Bearer 토큰을 검증하고 User 를 로드한 뒤 핸들러를 실행한다.
     * try 범위는 토큰 검증으로만 한정. 그 외 예외는 그대로 propagate 되어 GlobalExceptionHandler 가 처리.
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
}

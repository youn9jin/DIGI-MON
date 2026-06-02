package com.digimon.api.marketpage;

import com.digimon.api.auth.FirebaseTokenService;
import com.digimon.api.global.ResponseWrapper;
import com.digimon.api.marketpage.dto.SaveMarketPageSetupRequest;
import com.digimon.api.user.User;
import com.digimon.api.user.UserService;
import com.google.firebase.auth.FirebaseToken;
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
 * 시장 페이지 생성 설정(market_page_configs) 엔드포인트.
 * 인증/응답 패턴은 MarketPageController, StoresController 와 동일하게 유지한다.
 *
 * 엔드포인트:
 * - POST /api/market/page/setup : templateType/selectedSections/marketContent UPSERT. 200 반환.
 *
 * 401 정책: Authorization 헤더 없거나 토큰 검증 실패 시 raw Map 반환.
 *           나머지 도메인 예외는 GlobalExceptionHandler 가 ResponseWrapper.error 로 매핑.
 */
@RestController
@RequestMapping("/api")
public class MarketPageSetupController {

    private final FirebaseTokenService firebaseTokenService;
    private final UserService userService;
    private final MarketPageSetupService marketPageSetupService;

    public MarketPageSetupController(FirebaseTokenService firebaseTokenService,
                                     UserService userService,
                                     MarketPageSetupService marketPageSetupService) {
        this.firebaseTokenService = firebaseTokenService;
        this.userService = userService;
        this.marketPageSetupService = marketPageSetupService;
    }

    @PostMapping("/market/page/setup")
    public ResponseEntity<?> saveSetup(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody SaveMarketPageSetupRequest request) {
        return withAuthenticatedUser(authorization, user -> {
            MarketPageSetupService.Result result = marketPageSetupService.saveSetup(user, request);
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("marketId", result.getMarketId());
            data.put("templateType", result.getTemplateType());
            data.put("selectedSections", result.getSelectedSections());
            data.put("heroImageUrl", result.getHeroImageUrl());
            data.put("logoImageUrl", result.getLogoImageUrl());
            data.put("introImageUrl", result.getIntroImageUrl());
            return ResponseEntity.ok(ResponseWrapper.success(data));
        });
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

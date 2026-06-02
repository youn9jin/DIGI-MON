package com.digimon.api.marketpage;

import com.digimon.api.auth.FirebaseTokenService;
import com.digimon.api.global.ResponseWrapper;
import com.digimon.api.marketpage.dto.UpdateMarketPageTemplateRequest;
import com.digimon.api.user.User;
import com.digimon.api.user.UserService;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * 생성 완료된 시장 페이지 템플릿 교체 엔드포인트.
 *
 * 인증과 응답 패턴은 MarketPageTextController 와 동일하게 유지한다.
 * 401 은 raw Map, 나머지 도메인 응답은 ResponseWrapper 를 사용한다.
 */
@RestController
@RequestMapping("/api")
public class MarketPageTemplateController {

    private final FirebaseTokenService firebaseTokenService;
    private final UserService userService;
    private final MarketPageTemplateService marketPageTemplateService;

    public MarketPageTemplateController(FirebaseTokenService firebaseTokenService,
                                        UserService userService,
                                        MarketPageTemplateService marketPageTemplateService) {
        this.firebaseTokenService = firebaseTokenService;
        this.userService = userService;
        this.marketPageTemplateService = marketPageTemplateService;
    }

    /** DONE 페이지와 설정의 template_type 을 함께 갱신한다. */
    @PatchMapping("/market/page/template")
    public ResponseEntity<?> updateTemplate(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody(required = false) UpdateMarketPageTemplateRequest request) {
        return withAuthenticatedUser(authorization, user -> {
            MarketPageTemplateService.Result result = marketPageTemplateService.updateTemplate(user, request);
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("marketId", result.getMarketId());
            data.put("templateType", result.getTemplateType());
            return ResponseEntity.ok(ResponseWrapper.success(data));
        });
    }

    /**
     * Authorization Bearer 토큰을 검증하고 User 를 로드한 뒤 핸들러를 실행한다.
     * try 범위는 토큰 검증으로만 한정한다.
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

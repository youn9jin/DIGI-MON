package com.digimon.api.associations;

import com.digimon.api.associations.dto.OnboardingRequest;
import com.digimon.api.auth.FirebaseTokenService;
import com.digimon.api.market.Market;
import com.digimon.api.market.MarketRepository;
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
 * 상인회(ASSOCIATION) 온보딩 엔드포인트.
 * 인증/응답 패턴은 MeController 와 동일하게 유지한다.
 */
@RestController
@RequestMapping("/api")
public class AssociationsController {

    private final FirebaseTokenService firebaseTokenService;
    private final UserService userService;
    private final MarketRepository marketRepository;
    private final AssociationsService associationsService;

    public AssociationsController(FirebaseTokenService firebaseTokenService,
                                  UserService userService,
                                  MarketRepository marketRepository,
                                  AssociationsService associationsService) {
        this.firebaseTokenService = firebaseTokenService;
        this.userService = userService;
        this.marketRepository = marketRepository;
        this.associationsService = associationsService;
    }

    @PostMapping("/associations/onboarding")
    public ResponseEntity<?> onboarding(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody OnboardingRequest request) {
        return withAuthenticatedUser(authorization, user -> {
            if (marketRepository.existsByUserId(user.getId())) {
                throw new AlreadyOnboardedException("이미 온보딩이 완료된 계정입니다.");
            }
            Market saved = associationsService.createMarket(user, request);

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("marketId", saved.getId());
            body.put("name", saved.getName());
            body.put("message", "온보딩이 완료되었습니다.");
            return ResponseEntity.ok(body);
        });
    }

    /**
     * Authorization Bearer 토큰을 검증하고 User 를 로드한 뒤 핸들러를 실행한다.
     * try 범위는 토큰 검증으로만 한정한다. 그 외 예외(DB 오류, AlreadyOnboardedException,
     * ValidationErrorException 등)는 그대로 propagate 되어 GlobalExceptionHandler 가
     * 적절한 status 로 처리한다.
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

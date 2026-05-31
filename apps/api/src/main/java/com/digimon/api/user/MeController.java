package com.digimon.api.user;

import com.digimon.api.auth.FirebaseTokenService;
import com.digimon.api.market.Market;
import com.digimon.api.market.MarketRepository;
import com.digimon.api.user.dto.UpdateMeRequest;
import com.google.firebase.auth.FirebaseToken;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
public class MeController {

    private final FirebaseTokenService firebaseTokenService;
    private final UserService userService;
    private final MarketRepository marketRepository;

    public MeController(FirebaseTokenService firebaseTokenService,
                        UserService userService,
                        MarketRepository marketRepository) {
        this.firebaseTokenService = firebaseTokenService;
        this.userService = userService;
        this.marketRepository = marketRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return withAuthenticatedUser(authorization, user -> ResponseEntity.ok(buildMeResponse(user)));
    }

    @PatchMapping("/me")
    public ResponseEntity<?> patchMe(@RequestHeader(value = "Authorization", required = false) String authorization,
                                     @Valid @RequestBody UpdateMeRequest request) {
        return withAuthenticatedUser(authorization, user -> {
            User updated = userService.updateProfile(user.getId(), request);
            return ResponseEntity.ok(buildMeResponse(updated));
        });
    }

    /**
     * Authorization Bearer 토큰을 검증하고 User 를 로드한 뒤 핸들러를 실행한다.
     * try 범위는 토큰 검증으로만 한정한다. 그 외 예외(DB 오류, AuthAccountConflictException 등)는
     * 그대로 propagate 되어 GlobalExceptionHandler 가 적절한 status(409/500 등)로 처리한다.
     */
    private ResponseEntity<?> withAuthenticatedUser(String authorization,
                                                    java.util.function.Function<User, ResponseEntity<?>> handler) {
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

    /**
     * GET/PATCH /api/me 공용 응답 빌더. 두 엔드포인트의 응답 형태를 동일하게 유지한다.
     */
    private Map<String, Object> buildMeResponse(User user) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("id", user.getId());
        res.put("uid", user.getFirebaseUid());
        res.put("email", user.getEmail());
        res.put("name", user.getName());
        res.put("phone", user.getPhone());
        res.put("role", user.getRole());

        List<String> missing = new ArrayList<>();
        if (user.getRole() == null) {
            missing.add("role");
        } else if (user.getRole() == Role.ASSOCIATION) {
            Optional<Market> marketOpt = marketRepository.findByUserId(user.getId());
            if (marketOpt.isPresent()) {
                Market market = marketOpt.get();
                res.put("marketId", market.getId());
                res.put("marketName", market.getName());
                res.put("address", market.getAddress());
            } else {
                missing.add("market");
            }
        }
        if (!missing.isEmpty()) {
            res.put("missing", missing);
        }
        return res;
    }
}

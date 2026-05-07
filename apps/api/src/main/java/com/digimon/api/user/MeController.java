package com.digimon.api.user;

import com.digimon.api.auth.AuthAccountConflictException;
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
     * 검증 실패 시 401 응답을 반환하며 응답 포맷은 기존 GET /api/me 의 것을 유지한다.
     */
    private ResponseEntity<?> withAuthenticatedUser(String authorization,
                                                    java.util.function.Function<User, ResponseEntity<?>> handler) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message", "Missing or invalid Authorization header. Use: Bearer <ID_TOKEN>"
            ));
        }

        String idToken = authorization.substring("Bearer ".length()).trim();

        try {
            FirebaseToken decoded = firebaseTokenService.verify(idToken);
            User user = userService.getOrCreateFromFirebase(decoded);
            return handler.apply(user);
        } catch (AuthAccountConflictException e) {
            throw e;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message", "Invalid ID token",
                    "error", e.getMessage()
            ));
        }
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

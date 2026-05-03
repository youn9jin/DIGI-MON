package com.digimon.api.user;

import com.digimon.api.auth.AuthAccountConflictException;
import com.digimon.api.auth.FirebaseTokenService;
import com.digimon.api.market.Market;
import com.digimon.api.market.MarketRepository;
import com.google.firebase.auth.FirebaseToken;
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
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message", "Missing or invalid Authorization header. Use: Bearer <ID_TOKEN>"
            ));
        }

        String idToken = authorization.substring("Bearer ".length()).trim();

        try {
            FirebaseToken decoded = firebaseTokenService.verify(idToken);

            User user = userService.getOrCreateFromFirebase(decoded);

            Map<String, Object> res = new LinkedHashMap<>();
            res.put("id", user.getId());
            res.put("uid", user.getFirebaseUid());
            res.put("email", user.getEmail());
            res.put("name", user.getName());
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

            return ResponseEntity.ok(res);

        } catch (AuthAccountConflictException e) {
            throw e;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message", "Invalid ID token",
                    "error", e.getMessage()
            ));
        }
    }
}

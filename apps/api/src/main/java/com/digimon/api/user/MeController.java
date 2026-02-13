package com.digimon.api.user;

import com.digimon.api.auth.FirebaseTokenService;
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

    public MeController(FirebaseTokenService firebaseTokenService, UserService userService) {
        this.firebaseTokenService = firebaseTokenService;
        this.userService = userService;
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

            Map<String, Object> res = new HashMap<>();
            res.put("uid", user.getFirebaseUid());
            res.put("email", user.getEmail());
            res.put("name", user.getName());
            res.put("role", user.getRole());         // null 가능
            res.put("onboarded", user.isOnboarded());

            if (user.getRole() == null) {
                res.put("missing", List.of("role"));
            }

            return ResponseEntity.ok(res);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message", "Invalid ID token",
                    "error", e.getMessage()
            ));
        }
    }
}

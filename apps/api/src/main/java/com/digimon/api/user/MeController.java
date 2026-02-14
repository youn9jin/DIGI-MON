package com.digimon.api.user;

import com.digimon.api.auth.FirebaseTokenService;
import com.digimon.api.helper.HelperProfileRepository;
import com.digimon.api.owner.OwnerProfileRepository;
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
    private final OwnerProfileRepository ownerProfileRepository;
    private final HelperProfileRepository helperProfileRepository;

    public MeController(FirebaseTokenService firebaseTokenService, UserService userService,
                        OwnerProfileRepository ownerProfileRepository,
                        HelperProfileRepository helperProfileRepository) {
        this.firebaseTokenService = firebaseTokenService;
        this.userService = userService;
        this.ownerProfileRepository = ownerProfileRepository;
        this.helperProfileRepository = helperProfileRepository;
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

            List<String> missing = new ArrayList<>();
            if (user.getRole() == null) {
                missing.add("role");
            } else if (user.getRole() == Role.OWNER) {
                if (!ownerProfileRepository.existsById(user.getId())) {
                    missing.add("ownerProfile");
                }
            } else if (user.getRole() == Role.HELPER) {
                if (!helperProfileRepository.existsById(user.getId())) {
                    missing.add("helperProfile");
                }
            }
            if (!missing.isEmpty()) {
                res.put("missing", missing);
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

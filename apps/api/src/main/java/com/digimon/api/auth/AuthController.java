package com.digimon.api.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    /**
     * 회원가입은 Firebase Authentication에서 처리한다. 이 엔드포인트는 사용 중단(Deprecated).
     * 항상 410 Gone, body: {"message":"SIGNUP_HANDLED_BY_FIREBASE"}
     * @deprecated Signup is handled by Firebase Authentication; this endpoint is deprecated.
     */
    @Deprecated
    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> signup() {
        return ResponseEntity.status(HttpStatus.GONE)
                .body(Map.of("message", "SIGNUP_HANDLED_BY_FIREBASE"));
    }
}

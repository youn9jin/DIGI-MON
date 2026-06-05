package com.digimon.api.user;

import com.digimon.api.auth.FirebaseAccountService;
import com.digimon.api.auth.FirebaseTokenService;
import com.digimon.api.global.ResponseWrapper;
import com.digimon.api.market.Market;
import com.digimon.api.market.MarketRepository;
import com.digimon.api.user.dto.AssociationInfoResponse;
import com.digimon.api.user.dto.UpdateAssociationRequest;
import com.digimon.api.user.dto.UpdateMeRequest;
import com.google.firebase.auth.FirebaseToken;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
public class MeController {

    private static final Logger log = LoggerFactory.getLogger(MeController.class);

    private final FirebaseTokenService firebaseTokenService;
    private final FirebaseAccountService firebaseAccountService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final UserDeletionService userDeletionService;
    private final MarketRepository marketRepository;

    public MeController(FirebaseTokenService firebaseTokenService,
                        FirebaseAccountService firebaseAccountService,
                        UserService userService,
                        UserRepository userRepository,
                        UserDeletionService userDeletionService,
                        MarketRepository marketRepository) {
        this.firebaseTokenService = firebaseTokenService;
        this.firebaseAccountService = firebaseAccountService;
        this.userService = userService;
        this.userRepository = userRepository;
        this.userDeletionService = userDeletionService;
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

    @PatchMapping("/me/association")
    public ResponseEntity<?> patchAssociation(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody UpdateAssociationRequest request) {
        return withAuthenticatedUser(authorization, user -> {
            AssociationInfoResponse response = userService.updateAssociation(user.getId(), request);
            return ResponseEntity.ok(ResponseWrapper.success(response));
        });
    }

    /** 회원 계정과 연관 데이터를 hard delete 하고 Firebase 계정 삭제를 후속 처리한다. */
    @DeleteMapping("/me") // DELETE /api/me 요청을 처리한다.
    public ResponseEntity<?> deleteMe(@RequestHeader(value = "Authorization", required = false) String authorization) { // 회원 탈퇴 요청을 처리한다.
        return withExistingAuthenticatedUser(authorization, user -> { // DB 에 존재하는 인증 사용자로만 탈퇴를 진행한다.
            String firebaseUid = user.getFirebaseUid(); // 트랜잭션 후 Firebase 삭제에 사용할 UID 를 미리 보관한다.
            userDeletionService.deleteUserData(user); // DB hard delete 를 단일 트랜잭션 서비스에 위임한다.
            deleteFirebaseUserAfterCommit(firebaseUid); // DB 트랜잭션 커밋 후 Firebase 계정 삭제를 시도한다.
            return ResponseEntity.ok(ResponseWrapper.success(null)); // 성공 응답은 success=true,data=null 로 반환한다.
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
     * DELETE /api/me 전용 인증 헬퍼. Firebase 토큰은 검증하되 DB 유저가 없으면 새로 만들지 않고 401 을 반환한다.
     */
    private ResponseEntity<?> withExistingAuthenticatedUser(String authorization, // Authorization 헤더 값이다.
                                                            java.util.function.Function<User, ResponseEntity<?>> handler) { // 인증 성공 후 실행할 핸들러다.
        if (authorization == null || !authorization.startsWith("Bearer ")) { // 헤더 누락 또는 Bearer 형식 오류를 확인한다.
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of( // 401 raw Map 응답을 생성한다.
                    "message", "Missing or invalid Authorization header. Use: Bearer <ID_TOKEN>" // 기존 컨트롤러와 같은 메시지를 담는다.
            ));
        }

        String idToken = authorization.substring("Bearer ".length()).trim(); // Bearer 접두어를 제거하고 토큰만 추출한다.

        FirebaseToken decoded; // Firebase 검증 결과를 담을 변수를 선언한다.
        try { // 토큰 검증 실패를 401 로 바꾸기 위해 try 블록을 시작한다.
            decoded = firebaseTokenService.verify(idToken); // Firebase ID Token 을 검증한다.
        } catch (Exception e) { // 토큰 검증 실패를 잡는다.
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of( // 401 raw Map 응답을 생성한다.
                    "message", "Invalid ID token", // 토큰 검증 실패 메시지를 담는다.
                    "error", e.getMessage() // 디버깅용 원인 메시지를 담는다.
            ));
        }

        return userRepository.findByFirebaseUid(decoded.getUid()) // 검증된 Firebase UID 로 DB 사용자를 조회한다.
                .<ResponseEntity<?>>map(handler) // 사용자가 있으면 실제 요청 핸들러를 실행한다.
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of( // DB 사용자가 없으면 401 raw Map 을 반환한다.
                        "message", "User not found" // DB 유저 없음 메시지를 담는다.
                )));
    }

    /** Firebase 삭제 실패는 응답 실패로 전파하지 않고 ERROR 로그만 남긴다. */
    private void deleteFirebaseUserAfterCommit(String firebaseUid) { // 트랜잭션 밖에서 Firebase 계정을 삭제한다.
        try { // Firebase Admin SDK 실패를 삼키기 위해 try 블록을 시작한다.
            firebaseAccountService.deleteUser(firebaseUid); // Firebase Auth 계정 삭제를 호출한다.
        } catch (Exception e) { // Firebase 삭제 실패를 잡는다.
            log.error("Firebase user deletion failed. uid={}", firebaseUid, e); // ERROR 레벨 로그를 남기고 정상 응답 흐름을 유지한다.
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

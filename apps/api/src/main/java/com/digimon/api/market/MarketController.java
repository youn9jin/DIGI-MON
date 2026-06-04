package com.digimon.api.market; // 시장 API 패키지를 선언한다.

import com.digimon.api.auth.FirebaseTokenService; // Firebase ID Token 검증 서비스를 가져온다.
import com.digimon.api.global.ResponseWrapper; // 공통 성공 응답 래퍼를 가져온다.
import com.digimon.api.market.dto.UpdateMarketRequest; // 시장 수정 요청 DTO 를 가져온다.
import com.digimon.api.user.User; // 인증된 사용자 엔티티를 가져온다.
import com.digimon.api.user.UserService; // Firebase 사용자와 로컬 사용자 연결 서비스를 가져온다.
import com.google.firebase.auth.FirebaseToken; // Firebase 검증 결과 타입을 가져온다.
import org.springframework.http.HttpStatus; // 401 상태 코드를 만들기 위해 가져온다.
import org.springframework.http.ResponseEntity; // HTTP 응답 타입을 가져온다.
import org.springframework.web.bind.annotation.PatchMapping; // PATCH 매핑 어노테이션을 가져온다.
import org.springframework.web.bind.annotation.RequestBody; // 요청 본문 바인딩 어노테이션을 가져온다.
import org.springframework.web.bind.annotation.RequestHeader; // 요청 헤더 바인딩 어노테이션을 가져온다.
import org.springframework.web.bind.annotation.RequestMapping; // 컨트롤러 기본 경로 어노테이션을 가져온다.
import org.springframework.web.bind.annotation.RestController; // REST 컨트롤러 등록 어노테이션을 가져온다.

import java.util.LinkedHashMap; // 응답 필드 순서를 유지하기 위해 가져온다.
import java.util.Map; // raw 401 응답과 data 응답 타입으로 사용한다.
import java.util.function.Function; // 인증 후 핸들러 콜백 타입으로 사용한다.

/**
 * 시장 기본 정보 수정 엔드포인트.
 */
@RestController // JSON REST 컨트롤러로 등록한다.
@RequestMapping("/api") // 모든 엔드포인트의 기본 경로를 /api 로 지정한다.
public class MarketController { // 시장 기본 정보 API 를 담당한다.

    private final FirebaseTokenService firebaseTokenService; // Firebase ID Token 검증 의존성이다.

    private final UserService userService; // 검증된 Firebase 사용자로 로컬 User 를 조회하거나 생성하는 의존성이다.

    private final MarketService marketService; // 시장 수정 도메인 서비스 의존성이다.

    public MarketController(FirebaseTokenService firebaseTokenService, // Firebase 토큰 서비스를 주입받는다.
                            UserService userService, // User 서비스를 주입받는다.
                            MarketService marketService) { // Market 서비스를 주입받는다.
        this.firebaseTokenService = firebaseTokenService; // Firebase 토큰 서비스를 필드에 저장한다.
        this.userService = userService; // User 서비스를 필드에 저장한다.
        this.marketService = marketService; // Market 서비스를 필드에 저장한다.
    }

    /** null 이 아닌 시장 기본 정보 필드만 수정하고 수정된 필드명을 반환한다. */
    @PatchMapping("/market") // PATCH /api/market 요청을 처리한다.
    public ResponseEntity<?> updateMarket( // 시장 기본 정보 수정 응답을 반환한다.
            @RequestHeader(value = "Authorization", required = false) String authorization, // Authorization 헤더를 선택적으로 받는다.
            @RequestBody(required = false) UpdateMarketRequest request) { // JSON 요청 본문을 선택적으로 받는다.
        return withAuthenticatedUser(authorization, user -> { // 인증된 사용자 컨텍스트에서 수정 로직을 실행한다.
            MarketService.Result result = marketService.updateMarket(user, request); // 서비스에 시장 수정을 위임한다.
            Map<String, Object> data = new LinkedHashMap<>(); // 응답 data 객체의 필드 순서를 유지한다.
            data.put("marketId", result.getMarketId()); // 응답에 marketId 를 담는다.
            data.put("updatedFields", result.getUpdatedFields()); // 응답에 updatedFields 를 담는다.
            return ResponseEntity.ok(ResponseWrapper.success(data)); // 성공 응답을 ResponseWrapper 로 감싸 반환한다.
        });
    }

    /**
     * Authorization Bearer 토큰을 검증하고 User 를 로드한 뒤 핸들러를 실행한다.
     */
    private ResponseEntity<?> withAuthenticatedUser(String authorization, // Authorization 헤더 값이다.
                                                    Function<User, ResponseEntity<?>> handler) { // 인증 성공 후 실행할 핸들러다.
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

        User user = userService.getOrCreateFromFirebase(decoded); // 검증된 Firebase 토큰으로 로컬 User 를 조회하거나 생성한다.
        return handler.apply(user); // 인증된 User 를 사용해 실제 요청 핸들러를 실행한다.
    }
}

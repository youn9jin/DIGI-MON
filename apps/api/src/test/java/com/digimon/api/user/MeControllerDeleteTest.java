package com.digimon.api.user; // 사용자 컨트롤러 삭제 테스트 패키지를 선언한다.

import com.digimon.api.auth.FirebaseAccountService; // Firebase 계정 삭제 서비스 mock 을 위해 가져온다.
import com.digimon.api.auth.FirebaseTokenService; // Firebase 토큰 검증 서비스 mock 을 위해 가져온다.
import com.digimon.api.global.ResponseWrapper; // 성공 응답 래퍼 검증을 위해 가져온다.
import com.digimon.api.market.MarketRepository; // MeController 생성자 의존성 mock 을 위해 가져온다.
import com.google.firebase.auth.FirebaseToken; // 검증된 Firebase 토큰 mock 을 위해 가져온다.
import org.junit.jupiter.api.BeforeEach; // 각 테스트 전 fixture 생성을 위해 가져온다.
import org.junit.jupiter.api.DisplayName; // 테스트 표시명을 위해 가져온다.
import org.junit.jupiter.api.Test; // 테스트 메서드 표시를 위해 가져온다.
import org.junit.jupiter.api.extension.ExtendWith; // Mockito 확장을 적용하기 위해 가져온다.
import org.mockito.Mock; // mock 필드 선언을 위해 가져온다.
import org.mockito.junit.jupiter.MockitoExtension; // Mockito JUnit 5 확장을 가져온다.
import org.springframework.http.ResponseEntity; // 컨트롤러 응답 타입 검증을 위해 가져온다.

import java.util.Optional; // userRepository Optional 응답을 만들기 위해 가져온다.

import static org.assertj.core.api.Assertions.assertThat; // 값 검증 fluent assertion 을 가져온다.
import static org.mockito.Mockito.doThrow; // void 메서드 예외 stubbing 을 위해 가져온다.
import static org.mockito.Mockito.mock; // FirebaseToken mock 생성을 위해 가져온다.
import static org.mockito.Mockito.verify; // mock 호출 검증을 위해 가져온다.
import static org.mockito.Mockito.when; // mock stubbing 을 위해 가져온다.

@ExtendWith(MockitoExtension.class) // Mockito mock 초기화를 JUnit 5 확장으로 처리한다.
class MeControllerDeleteTest { // MeController DELETE /api/me 단위 테스트 클래스다.

    @Mock // FirebaseTokenService 를 mock 으로 대체한다.
    FirebaseTokenService firebaseTokenService; // Firebase ID Token 검증 서비스 mock 이다.

    @Mock // FirebaseAccountService 를 mock 으로 대체한다.
    FirebaseAccountService firebaseAccountService; // Firebase 계정 삭제 서비스 mock 이다.

    @Mock // UserService 를 mock 으로 대체한다.
    UserService userService; // 기존 GET/PATCH 생성자 의존성 mock 이다.

    @Mock // UserRepository 를 mock 으로 대체한다.
    UserRepository userRepository; // DELETE 전용 DB 사용자 조회 repository mock 이다.

    @Mock // UserDeletionService 를 mock 으로 대체한다.
    UserDeletionService userDeletionService; // DB hard delete 서비스 mock 이다.

    @Mock // MarketRepository 를 mock 으로 대체한다.
    MarketRepository marketRepository; // 기존 GET/PATCH 응답 생성자 의존성 mock 이다.

    MeController meController; // 테스트 대상 컨트롤러다.

    @BeforeEach // 각 테스트 전에 실행한다.
    void setUp() { // 공통 fixture 를 만든다.
        meController = new MeController( // 테스트 대상 컨트롤러를 직접 생성한다.
                firebaseTokenService, // Firebase 토큰 검증 mock 을 전달한다.
                firebaseAccountService, // Firebase 계정 삭제 mock 을 전달한다.
                userService, // UserService mock 을 전달한다.
                userRepository, // UserRepository mock 을 전달한다.
                userDeletionService, // UserDeletionService mock 을 전달한다.
                marketRepository); // MarketRepository mock 을 전달한다.
    }

    @Test // Firebase 삭제 실패 케이스를 테스트한다.
    @DisplayName("Firebase 삭제 실패 시에도 DB 롤백 없이 200을 반환한다") // 테스트 의도를 설명한다.
    void deleteMe_firebaseDeletionFails_returnsOk() throws Exception { // Firebase 삭제 예외를 삼키는지 검증한다.
        FirebaseToken token = mock(FirebaseToken.class); // FirebaseToken mock 을 생성한다.
        when(token.getUid()).thenReturn("uid-1"); // 검증된 토큰의 UID 를 지정한다.
        User user = new User(); // 탈퇴 대상 사용자를 생성한다.
        user.setId(1L); // 사용자 ID 를 지정한다.
        user.setFirebaseUid("uid-1"); // Firebase 삭제에 사용할 UID 를 지정한다.
        when(firebaseTokenService.verify("token")).thenReturn(token); // Authorization 토큰 검증 결과를 설정한다.
        when(userRepository.findByFirebaseUid("uid-1")).thenReturn(Optional.of(user)); // DB 사용자 조회 결과를 설정한다.
        doThrow(new RuntimeException("firebase down")).when(firebaseAccountService).deleteUser("uid-1"); // Firebase 삭제 실패를 설정한다.

        ResponseEntity<?> response = meController.deleteMe("Bearer token"); // DELETE /api/me 컨트롤러 메서드를 실행한다.

        assertThat(response.getStatusCode().value()).isEqualTo(200); // HTTP 200 응답인지 검증한다.
        assertThat(response.getBody()).isInstanceOf(ResponseWrapper.class); // 응답 본문이 ResponseWrapper 인지 검증한다.
        ResponseWrapper<?> body = (ResponseWrapper<?>) response.getBody(); // 응답 본문을 ResponseWrapper 로 캐스팅한다.
        assertThat(body.isSuccess()).isTrue(); // success=true 인지 검증한다.
        assertThat(body.getData()).isNull(); // data=null 인지 검증한다.
        verify(userDeletionService).deleteUserData(user); // DB 삭제 서비스가 호출됐는지 검증한다.
        verify(firebaseAccountService).deleteUser("uid-1"); // Firebase 삭제 시도가 호출됐는지 검증한다.
    }
}

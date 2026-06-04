package com.digimon.api.auth; // Firebase 계정 관리 서비스 패키지를 선언한다.

import com.google.firebase.auth.FirebaseAuth; // Firebase Admin SDK 진입점을 가져온다.
import org.springframework.stereotype.Service; // Spring Service 빈 등록을 위해 가져온다.

/**
 * Firebase Auth 계정 관리 기능을 감싸는 서비스.
 */
@Service // Spring 서비스 빈으로 등록한다.
public class FirebaseAccountService { // Firebase 계정 삭제 기능을 담당한다.

    public void deleteUser(String firebaseUid) throws Exception { // Firebase UID 로 계정을 삭제한다.
        FirebaseAuth.getInstance().deleteUser(firebaseUid); // Firebase Admin SDK 의 deleteUser 를 호출한다.
    }
}

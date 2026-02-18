package com.digimon.api.user;

import com.google.firebase.auth.FirebaseToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Firebase ID Token 검증 후 호출. firebase_uid 기준 조회, 없으면 생성.
     * Google / Email·Password 모두 Firebase 인증 사용자로 동일하게 provider=GOOGLE 저장.
     * password_hash 는 사용하지 않음(항상 null 유지).
     */
    @Transactional
    public User getOrCreateFromFirebase(FirebaseToken token) {
        String uid = token.getUid();

        return userRepository.findByFirebaseUid(uid)
                .orElseGet(() -> {
                    User u = new User();
                    u.setProvider(AuthProvider.GOOGLE);
                    u.setFirebaseUid(uid);
                    u.setEmail(token.getEmail());
                    u.setName(token.getName());
                    // passwordHash 는 설정하지 않음 (Firebase 인증만 사용)
                    return userRepository.save(u);
                });
    }
}

package com.digimon.api.user;

import com.digimon.api.auth.AuthAccountConflictException;
import com.digimon.api.user.dto.UpdateMeRequest;
import com.google.firebase.auth.FirebaseToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Firebase ID Token 검증 후 호출.
     * 1) firebase_uid로 조회 → 있으면 반환.
     * 2) 없으면 email로 조회 → 레거시 유저: firebase_uid가 비어 있으면 연결(업데이트) 후 반환; 이미 다른 uid면 409.
     * 3) 둘 다 없으면 신규 생성.
     * 동시성: 생성 시 email unique 위반 시 재조회 후 연결/409 처리.
     */
    @Transactional
    public User getOrCreateFromFirebase(FirebaseToken token) {
        String uid = token.getUid();
        String email = token.getEmail();

        return userRepository.findByFirebaseUid(uid)
                .orElseGet(() -> findOrCreateByEmail(uid, email, token.getName()));
    }

    private User findOrCreateByEmail(String uid, String email, String name) {
        return userRepository.findByEmail(email)
                .map(existing -> linkOrConflict(uid, email, existing))
                .orElseGet(() -> createNewUser(uid, email, name));
    }

    private User linkOrConflict(String uid, String email, User existing) {
        String existingUid = existing.getFirebaseUid();
        if (isBlank(existingUid)) {
            existing.setFirebaseUid(uid);
            existing.setProvider(AuthProvider.GOOGLE);
            User saved = userRepository.save(existing);
            log.info("[auth] legacy user linked: email={} userId={} uid={}", email, saved.getId(), uid);
            return saved;
        }
        if (!existingUid.equals(uid)) {
            log.warn("[auth] account conflict: email={} existingUid={} incomingUid={}", email, existingUid, uid);
            throw new AuthAccountConflictException("Email already linked to another account");
        }
        return existing;
    }

    private User createNewUser(String uid, String email, String name) {
        try {
            User u = new User();
            u.setProvider(AuthProvider.GOOGLE);
            u.setFirebaseUid(uid);
            u.setEmail(email != null ? email : "");
            u.setName(name);
            u.setRole(Role.ASSOCIATION);
            return userRepository.save(u);
        } catch (DataIntegrityViolationException e) {
            return userRepository.findByFirebaseUid(uid)
                    .orElseGet(() -> {
                        return userRepository.findByEmail(email)
                                .map(existing -> linkOrConflict(uid, email, existing))
                                .orElseThrow(() -> e);
                    });
        }
    }

    /**
     * 내 프로필 부분 수정. 요청에서 null이 아닌 필드만 반영(partial update).
     * 새 필드 확장 시 UpdateMeRequest 에 추가 후 여기 null-check 한 줄 추가.
     */
    @Transactional
    public User updateProfile(Long userId, UpdateMeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found: " + userId));

        if (request.getName() != null) {
            user.setName(request.getName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        return userRepository.save(user);
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}

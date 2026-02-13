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

    @Transactional
    public User getOrCreateFromFirebase(FirebaseToken token) {
        String uid = token.getUid();

        return userRepository.findByFirebaseUid(uid)
                .orElseGet(() -> {
                    User u = new User();
                    u.setFirebaseUid(uid);
                    u.setEmail(token.getEmail());
                    u.setName(token.getName());
                    // role=null, onboarded=false 기본
                    return userRepository.save(u);
                });
    }
}

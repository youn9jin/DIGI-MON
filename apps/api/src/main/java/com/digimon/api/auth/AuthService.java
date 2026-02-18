package com.digimon.api.auth;

import com.digimon.api.auth.dto.SignupRequest;
import com.digimon.api.auth.dto.SignupResponse;
import com.digimon.api.user.AuthProvider;
import com.digimon.api.user.User;
import com.digimon.api.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /** @deprecated 회원가입은 Firebase가 처리. 현재 호출되지 않음. 삭제 시 별도 PR 권장. */
    @Deprecated
    @Transactional
    public SignupResponse signup(SignupRequest request) {
        if (userRepository.findByEmail(request.getEmail().trim()).isPresent()) {
            throw new EmailAlreadyExistsException();
        }

        String hashed = passwordEncoder.encode(request.getPassword());

        User user = new User();
        user.setProvider(AuthProvider.LOCAL);
        user.setEmail(request.getEmail().trim());
        user.setPasswordHash(hashed);
        user.setName(trimToNull(request.getName()));
        user.setPhone(trimToNull(request.getPhone()));
        user.setFirebaseUid(null);
        user.setRole(null);
        user.setOnboarded(false);

        user = userRepository.save(user);

        List<String> missing = user.getRole() == null ? List.of("role") : List.of();
        return new SignupResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getPhone(),
                user.getProvider().name(),
                user.getRole(),
                user.isOnboarded(),
                missing
        );
    }

    private static String trimToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}

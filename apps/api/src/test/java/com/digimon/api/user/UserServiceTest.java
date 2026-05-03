package com.digimon.api.user;

import com.digimon.api.auth.AuthAccountConflictException;
import com.google.firebase.auth.FirebaseToken;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    UserRepository userRepository;

    @InjectMocks
    UserService userService;

    private static FirebaseToken token(String uid, String email, String name) {
        FirebaseToken t = mock(FirebaseToken.class);
        when(t.getUid()).thenReturn(uid);
        when(t.getEmail()).thenReturn(email);
        when(t.getName()).thenReturn(name);
        return t;
    }

    @Test
    @DisplayName("uid로 기존 유저 찾음 → 그대로 반환")
    void getOrCreateFromFirebase_foundByUid_returnsUser() {
        FirebaseToken token = token("uid1", "a@b.com", "Name");
        User user = new User();
        user.setId(1L);
        user.setFirebaseUid("uid1");
        user.setEmail("a@b.com");
        user.setProvider(AuthProvider.GOOGLE);

        when(userRepository.findByFirebaseUid("uid1")).thenReturn(Optional.of(user));

        User result = userService.getOrCreateFromFirebase(token);

        assertThat(result).isSameAs(user);
        verify(userRepository).findByFirebaseUid("uid1");
        verify(userRepository, never()).findByEmail(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("uid로 없음 + email로 찾음 + firebase_uid NULL → firebase_uid 업데이트 후 반환")
    void getOrCreateFromFirebase_legacyUser_nullUid_linksAndReturns() {
        FirebaseToken token = token("uid-new", "legacy@b.com", "Legacy");
        when(userRepository.findByFirebaseUid("uid-new")).thenReturn(Optional.empty());

        User legacy = new User();
        legacy.setId(2L);
        legacy.setFirebaseUid(null);
        legacy.setEmail("legacy@b.com");
        legacy.setProvider(AuthProvider.GOOGLE);
        when(userRepository.findByEmail("legacy@b.com")).thenReturn(Optional.of(legacy));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User result = userService.getOrCreateFromFirebase(token);

        assertThat(result.getFirebaseUid()).isEqualTo("uid-new");
        assertThat(result.getEmail()).isEqualTo("legacy@b.com");
        verify(userRepository).save(legacy);
    }

    @Test
    @DisplayName("uid로 없음 + email로 찾음 + firebase_uid 다른 값 → 409 반환")
    void getOrCreateFromFirebase_sameEmail_differentUid_throws409() {
        FirebaseToken token = token("uid-incoming", "conflict@b.com", "Name");
        when(userRepository.findByFirebaseUid("uid-incoming")).thenReturn(Optional.empty());

        User existing = new User();
        existing.setId(3L);
        existing.setFirebaseUid("uid-other");
        existing.setEmail("conflict@b.com");
        existing.setProvider(AuthProvider.GOOGLE);
        when(userRepository.findByEmail("conflict@b.com")).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> userService.getOrCreateFromFirebase(token))
                .isInstanceOf(AuthAccountConflictException.class)
                .hasMessageContaining("already linked");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("uid/email 모두 없음 → 신규 생성 시 role=ASSOCIATION 기본값")
    void getOrCreateFromFirebase_newUser_defaultsRoleToAssociation() {
        FirebaseToken token = token("uid-fresh", "fresh@b.com", "Fresh");
        when(userRepository.findByFirebaseUid("uid-fresh")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("fresh@b.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User result = userService.getOrCreateFromFirebase(token);

        assertThat(result.getFirebaseUid()).isEqualTo("uid-fresh");
        assertThat(result.getEmail()).isEqualTo("fresh@b.com");
        assertThat(result.getProvider()).isEqualTo(AuthProvider.GOOGLE);
        assertThat(result.getRole()).isEqualTo(Role.ASSOCIATION);
        verify(userRepository).save(any(User.class));
    }
}

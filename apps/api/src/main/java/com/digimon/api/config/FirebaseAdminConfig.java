package com.digimon.api.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseAdminConfig {

    @Value("${firebase.admin.credential-json:}")
    private String credentialJson;

    @PostConstruct
    public void init() throws IOException {
        if (!FirebaseApp.getApps().isEmpty()) return;

        if (credentialJson == null || credentialJson.isBlank()) {
            throw new IllegalStateException(
                    "Firebase 자격증명이 비어있습니다. 환경변수 FIREBASE_CREDENTIAL_JSON " +
                            "(또는 firebase.admin.credential-json 프로퍼티)에 서비스 어카운트 JSON 전체를 주입하세요."
            );
        }

        // 환경변수/yml 으로 다중행 JSON 을 넘길 때 private_key 의 개행이
        // 리터럴 두 글자(\n) 로 들어오는 케이스를 실제 LF 로 복원.
        String normalized = credentialJson.replace("\\n", "\n");

        try (ByteArrayInputStream in = new ByteArrayInputStream(
                normalized.getBytes(StandardCharsets.UTF_8))) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(in))
                    .build();

            FirebaseApp.initializeApp(options);
        }
    }
}

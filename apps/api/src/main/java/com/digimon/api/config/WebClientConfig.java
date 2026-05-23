package com.digimon.api.config;

import io.netty.channel.ChannelOption;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

/**
 * FastAPI 호출용 WebClient 빈.
 *
 * - baseUrl: digimon.ai.base-url (env DIGIMON_AI_BASE_URL, Q2-B 결정에 따라 기존 키 재사용)
 * - 연결 타임아웃: 10초 (사양 고정)
 * - 응답 타임아웃: digimon.ai.market-page-timeout-ms (env DIGIMON_AI_MARKET_PAGE_TIMEOUT_MS, default 60000)
 *
 * Bean 이름 "aiWebClient" 로 등록 — 추후 다른 외부 호출용 WebClient 가 늘어날 가능성을 고려해
 * 기본 타입(WebClient) 단독 주입 대신 명시적 이름 주입을 권장.
 */
@Configuration
public class WebClientConfig {

    private static final long CONNECT_TIMEOUT_MS = 10_000L;

    @Value("${digimon.ai.base-url}")
    private String baseUrl;

    @Value("${digimon.ai.market-page-timeout-ms:60000}")
    private long marketPageTimeoutMs;

    @Bean
    public WebClient aiWebClient() {
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, (int) CONNECT_TIMEOUT_MS)
                .responseTimeout(Duration.ofMillis(marketPageTimeoutMs));

        return WebClient.builder()
                .baseUrl(baseUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }
}

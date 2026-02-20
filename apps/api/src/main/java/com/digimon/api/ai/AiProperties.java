package com.digimon.api.ai;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "digimon.ai")
public class AiProperties {

    /** AI 서비스 base URL (예: http://localhost:8000) */
    private String baseUrl = "http://localhost:8000";

    /** 호출 타임아웃(ms). 기본 3초 */
    private int timeoutMs = 3000;

    /** true일 때만 HTTP 호출. false면 Template만 사용 */
    private boolean enabled = false;

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public int getTimeoutMs() {
        return timeoutMs;
    }

    public void setTimeoutMs(int timeoutMs) {
        this.timeoutMs = timeoutMs;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}

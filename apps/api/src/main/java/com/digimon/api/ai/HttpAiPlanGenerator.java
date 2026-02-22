package com.digimon.api.ai;

import com.digimon.api.ai.dto.AiGenerateRequest;
import com.digimon.api.ai.dto.AiGenerateResponse;
import com.digimon.api.ai.dto.AiStage;
import com.digimon.api.plandraft.DigitalLevel;
import com.digimon.api.plandraft.dto.PlanActionDto;
import com.digimon.api.plandraft.dto.SurveyDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

/**
 * AI 마이크로서비스 HTTP 연동 구현체.
 * POST {baseUrl}/internal/plan/generate 호출. 요청에 Backend 산정 digitalLevel 포함, 응답에는 digitalLevel 없음(initialPlan만 파싱).
 * enabled=false이면 호출하지 말 것(FallbackAiPlanGenerator에서 처리).
 */
@Component
public class HttpAiPlanGenerator implements AiPlanGenerator {

    private static final String PATH = "/internal/plan/generate";
    private static final String DEFAULT_LOCALE = "ko-KR";
    private static final Logger log = LoggerFactory.getLogger(HttpAiPlanGenerator.class);

    private final AiProperties properties;
    private final RestClient restClient;

    public HttpAiPlanGenerator(AiProperties properties) {
        this.properties = properties;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofMillis(properties.getTimeoutMs()));
        factory.setReadTimeout(Duration.ofMillis(properties.getTimeoutMs()));
        this.restClient = RestClient.builder()
                .requestFactory(factory)
                .build();
    }

    @Override
    public List<PlanActionDto> generateInitialPlan(SurveyDto survey, DigitalLevel digitalLevel) {
        if (!properties.isEnabled()) {
            throw new AiUnavailableException("AI disabled (digimon.ai.enabled=false)");
        }

        String requestId = UUID.randomUUID().toString();
        String baseUrl = properties.getBaseUrl().replaceAll("/$", "");
        String url = baseUrl + PATH;

        AiGenerateRequest body = AiGenerateRequest.builder()
                .requestId(requestId)
                .stage(AiStage.PRE_LOGIN)
                .locale(DEFAULT_LOCALE)
                .digitalLevel(digitalLevel)
                .survey(survey)
                .build();

        log.info("[AI] plan generate start requestId={} url={} digitalLevel={}", requestId, url, digitalLevel);

        try {
            AiGenerateResponse response = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(AiGenerateResponse.class);

            if (response == null || response.getInitialPlan() == null || response.getInitialPlan().isEmpty()) {
                log.warn("[AI] plan generate empty response requestId={}", requestId);
                throw new AiUnavailableException("AI returned empty initialPlan");
            }

            log.info("[AI] plan generate success requestId={}", requestId);
            return response.getInitialPlan();
        } catch (Exception e) {
            log.warn("[AI] plan generate failed requestId={} error={}", requestId, e.getMessage());
            throw new AiUnavailableException("AI call failed: " + e.getMessage(), e);
        }
    }

    /**
     * FINALIZE 단계: POST /internal/plan/generate with stage=FINALIZE.
     * 타임아웃 3초. 실패/파싱 실패 시 null 반환 → 호출측에서 Template fallback 사용.
     */
    public Object generateFinalPlan(AiGenerateRequest request) {
        if (request == null || request.getStage() != AiStage.FINALIZE) {
            log.warn("[AI] finalize skipped: invalid request or stage");
            return null;
        }
        String requestId = request.getRequestId() != null ? request.getRequestId() : UUID.randomUUID().toString();
        String baseUrl = properties.getBaseUrl().replaceAll("/$", "");
        String url = baseUrl + PATH;

        log.info("[AI] finalize start requestId={} url={} draftId/caller", requestId, url);

        try {
            AiGenerateResponse response = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(AiGenerateResponse.class);

            if (response == null || response.getFinalPlan() == null) {
                log.warn("[AI] finalize empty response requestId={}", requestId);
                return null;
            }
            log.info("[AI] finalize success requestId={}", requestId);
            return response.getFinalPlan();
        } catch (Exception e) {
            log.warn("[AI] finalize failed requestId={} error={}", requestId, e.getMessage());
            return null;
        }
    }

    /**
     * AI 호출 불가(비활성/타임아웃/연결실패/파싱실패) 시 Fallback에서 사용하기 위한 예외.
     */
    public static class AiUnavailableException extends RuntimeException {
        public AiUnavailableException(String message) {
            super(message);
        }

        public AiUnavailableException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}

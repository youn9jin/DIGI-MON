package com.digimon.api.marketpage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * pageId 별 SseEmitter 를 보관·통지하는 컴포넌트.
 *
 * Q5-B 결정에 따라 register() API 는 정의되어 있으나, 이번 PR 에서 호출처(SSE 구독 엔드포인트)는
 * 추가하지 않는다. sendDone / sendFailed 는 등록된 emitter 가 없으면 no-op 으로 안전하게 종료한다
 * (DB 의 status 컬럼이 source of truth 이므로 SSE 미수신은 데이터 정합성에 영향 없음).
 *
 * 스레드 안전: ConcurrentHashMap 으로 보관. 백그라운드 @Async 스레드에서 호출되므로 필수.
 */
@Component
public class SseEmitterManager {

    private static final Logger log = LoggerFactory.getLogger(SseEmitterManager.class);

    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    /** SSE 엔드포인트(추후 PR)에서 emitter 를 등록할 때 사용. */
    public SseEmitter register(Long pageId, SseEmitter emitter) {
        emitters.put(pageId, emitter);
        // 클라이언트가 끊거나 타임아웃 시 자동 정리
        emitter.onCompletion(() -> emitters.remove(pageId, emitter));
        emitter.onTimeout(() -> emitters.remove(pageId, emitter));
        emitter.onError(e -> emitters.remove(pageId, emitter));
        return emitter;
    }

    /** 백그라운드 작업 성공 시 호출. emit 후 자동으로 complete + remove 처리. */
    public void sendDone(Long pageId) {
        sendAndComplete(pageId, "DONE", Map.of(
                "pageId", pageId,
                "status", "DONE"
        ));
    }

    /** 백그라운드 작업 실패/타임아웃 시 호출. emit 후 자동으로 complete + remove 처리. */
    public void sendFailed(Long pageId, String errorMessage) {
        sendAndComplete(pageId, "FAILED", Map.of(
                "pageId", pageId,
                "status", "FAILED",
                "error", errorMessage != null ? errorMessage : "unknown error"
        ));
    }

    /** 외부에서 명시적으로 정리할 때 사용. */
    public void remove(Long pageId) {
        emitters.remove(pageId);
    }

    private void sendAndComplete(Long pageId, String eventName, Object payload) {
        SseEmitter emitter = emitters.get(pageId);
        if (emitter == null) {
            // Q5-B: register 호출처가 아직 없으므로 일반적인 동작 경로. 로그만 남김.
            log.debug("SSE emitter not registered for pageId={} ({}), skip push.", pageId, eventName);
            return;
        }
        try {
            emitter.send(SseEmitter.event().name(eventName).data(payload));
            emitter.complete();
        } catch (IOException e) {
            log.warn("SSE emit failed for pageId={} event={}: {}", pageId, eventName, e.getMessage());
            try {
                emitter.completeWithError(e);
            } catch (Exception ignored) {
                // 이미 complete 된 경우 무시
            }
        } finally {
            emitters.remove(pageId);
        }
    }
}

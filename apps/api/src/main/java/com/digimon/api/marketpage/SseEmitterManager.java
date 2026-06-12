package com.digimon.api.marketpage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * pageId 별 SseEmitter 를 보관·통지하는 컴포넌트.
 *
 * GET /api/market/page/status/{pageId} 구독 시 register() 로 등록되고,
 * 백그라운드 @Async 작업 완료 시 sendDone / sendFailed 로 push 된다.
 * 등록된 emitter 가 없으면 sendDone / sendFailed 는 no-op 으로 안전하게 종료한다
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

    /**
     * 백그라운드 작업 성공 시 호출. emit 후 자동으로 complete + remove 처리.
     * 이벤트명은 프론트 EventSource.addEventListener('done', ...) 기준 소문자.
     * data 의 status 는 명세대로 대문자 enum 값 유지.
     */
    // done 이벤트에 marketId 포함 — 프론트 라우팅에 사용됨
    public void sendDone(Long pageId, Long marketId) {
        sendAndComplete(pageId, "done", Map.of(
                "pageId", pageId,
                "marketId", marketId,
                "status", "DONE"
        ));
    }

    /** 백그라운드 작업 실패/타임아웃 시 호출. emit 후 자동으로 complete + remove 처리. */
    public void sendFailed(Long pageId, String errorMessage) {
        sendAndComplete(pageId, "failed", Map.of(
                "pageId", pageId,
                "status", "FAILED",
                "error", errorMessage != null ? errorMessage : "unknown error"
        ));
    }

    /** 외부에서 명시적으로 정리할 때 사용. */
    public void remove(Long pageId) {
        emitters.remove(pageId);
    }

    /**
     * 등록된 모든 emitter 에 ping 이벤트(data: {})를 보낸다. 죽은 연결(send 실패)은 즉시 정리한다.
     * MarketPageScheduler 의 @Scheduled 에서 주기적으로 호출한다 (스케줄 작업은 스케줄러에 집중).
     */
    public void pingAll() {
        if (emitters.isEmpty()) {
            return;
        }
        for (Map.Entry<Long, SseEmitter> entry : emitters.entrySet()) {
            Long pageId = entry.getKey();
            SseEmitter emitter = entry.getValue();
            try {
                emitter.send(SseEmitter.event().name("ping").data(Collections.emptyMap()));
            } catch (Exception e) {
                // 클라이언트가 이미 끊긴 연결 → 맵에서 제거. onError 콜백과 중복돼도 remove 는 멱등.
                log.debug("SSE ping failed for pageId={}, removing dead emitter: {}", pageId, e.getMessage());
                emitters.remove(pageId, emitter);
            }
        }
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

package com.digimon.api.marketpage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 서버 재시작 등으로 백그라운드 작업이 유실되어 PENDING 이 영구히 남는 것을 방지한다.
 *
 * 주기: 5분 (fixedDelay = 300_000ms)
 * 조건: status=PENDING && createdAt < now - 5분 → status=FAILED 로 UPDATE
 *
 * 기준은 row 의 created_at — PENDING 상태가 된 시점은 row 생성 시점이다.
 * (updated_at 기준으로 하면 row reset 시 타이머가 초기화되어 의도와 다르게 동작함)
 */
@Component
public class MarketPageScheduler {

    private static final Logger log = LoggerFactory.getLogger(MarketPageScheduler.class);

    private static final long FIXED_DELAY_MS = 300_000L; // 5 minutes
    private static final Duration STALE_THRESHOLD = Duration.ofMinutes(5);

    private final MarketPageRepository marketPageRepository;

    public MarketPageScheduler(MarketPageRepository marketPageRepository) {
        this.marketPageRepository = marketPageRepository;
    }

    @Scheduled(fixedDelay = FIXED_DELAY_MS)
    @Transactional
    public void failStalePending() {
        LocalDateTime threshold = LocalDateTime.now().minus(STALE_THRESHOLD);
        List<MarketPage> stale = marketPageRepository.findByStatusAndCreatedAtBefore(
                MarketPageStatus.PENDING, threshold);

        if (stale.isEmpty()) {
            return;
        }

        for (MarketPage page : stale) {
            page.setStatus(MarketPageStatus.FAILED);
        }
        log.info("market_pages stale PENDING → FAILED: {} row(s)", stale.size());
    }
}

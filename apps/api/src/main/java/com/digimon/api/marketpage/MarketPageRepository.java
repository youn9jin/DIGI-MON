package com.digimon.api.marketpage;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MarketPageRepository extends JpaRepository<MarketPage, Long> {

    Optional<MarketPage> findByMarketId(Long marketId);

    /**
     * 스케줄러가 stale PENDING 을 FAILED 로 정리할 때 사용.
     * 사양 그대로 row 의 created_at 기준 — "생성된 지 5분이 넘었는데 PENDING 인 row".
     */
    List<MarketPage> findByStatusAndCreatedAtBefore(MarketPageStatus status, LocalDateTime createdAtBefore);
}

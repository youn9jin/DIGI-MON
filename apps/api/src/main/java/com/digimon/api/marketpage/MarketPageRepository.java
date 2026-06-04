package com.digimon.api.marketpage;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MarketPageRepository extends JpaRepository<MarketPage, Long> {

    Optional<MarketPage> findByMarketId(Long marketId);

    /** 회원 탈퇴 시 market 기준 생성 페이지를 삭제한다. */
    long deleteByMarketId(Long marketId);

    /** 텍스트 수정 API 가 market_id 와 생성 상태를 함께 확인할 때 사용. */
    Optional<MarketPage> findByMarketIdAndStatus(Long marketId, MarketPageStatus status);

    /**
     * 스케줄러가 stale PENDING 을 FAILED 로 정리할 때 사용.
     * 사양 그대로 row 의 created_at 기준 — "생성된 지 5분이 넘었는데 PENDING 인 row".
     */
    List<MarketPage> findByStatusAndCreatedAtBefore(MarketPageStatus status, LocalDateTime createdAtBefore);

    /**
     * SSE 구독 시 race 재확인용. 영속성 컨텍스트의 1차 캐시 엔티티 대신 DB 의 최신 status 를 scalar 로 조회한다.
     * (구독 직전 로드한 엔티티와 register 사이에 @Async 작업이 commit 했을 수 있어 신선한 값이 필요)
     */
    @Query("select p.status from MarketPage p where p.id = :id")
    Optional<MarketPageStatus> findStatusById(@Param("id") Long id);
}

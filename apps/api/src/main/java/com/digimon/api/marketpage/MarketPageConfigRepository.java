package com.digimon.api.marketpage;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MarketPageConfigRepository extends JpaRepository<MarketPageConfig, Long> {

    Optional<MarketPageConfig> findByMarketId(Long marketId);

    /** 회원 탈퇴 시 market 기준 페이지 설정을 삭제한다. */
    long deleteByMarketId(Long marketId);
}

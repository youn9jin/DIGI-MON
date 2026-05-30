package com.digimon.api.marketpage;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MarketPageConfigRepository extends JpaRepository<MarketPageConfig, Long> {

    Optional<MarketPageConfig> findByMarketId(Long marketId);
}

package com.digimon.api.marketpage;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MarketPageRepository extends JpaRepository<MarketPage, Long> {

    Optional<MarketPage> findByMarketId(Long marketId);
}

package com.digimon.api.market;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MarketRepository extends JpaRepository<Market, Long> {

    Optional<Market> findByUserId(Long userId);
}

package com.digimon.api.market;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MarketRepository extends JpaRepository<Market, Long> {

    Optional<Market> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    /** 회원 탈퇴 시 user 기준 market 을 삭제한다. */
    long deleteByUserId(Long userId);
}

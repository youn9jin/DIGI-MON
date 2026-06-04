package com.digimon.api.store;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StoreRepository extends JpaRepository<Store, Long> {

    List<Store> findByMarketId(Long marketId);

    long countByMarketId(Long marketId);

    /** 회원 탈퇴 시 market 기준 점포를 삭제한다. */
    long deleteByMarketId(Long marketId);
}

package com.digimon.api.store;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StoreRepository extends JpaRepository<Store, Long> {

    List<Store> findByMarketId(Long marketId);

    long countByMarketId(Long marketId);
}

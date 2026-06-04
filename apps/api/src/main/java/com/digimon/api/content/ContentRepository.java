package com.digimon.api.content;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContentRepository extends JpaRepository<Content, Long> {

    List<Content> findByMarketIdOrderByCreatedAtDesc(Long marketId);

    long countByMarketId(Long marketId);

    /**
     * 점포 삭제(DELETE /api/stores/{storeId}) 시 cascade 처리용.
     * 호출자(StoresService.deleteStore) 의 @Transactional 안에서 실행된다.
     */
    long deleteByStoreId(Long storeId);

    /** 회원 탈퇴 시 market 기준 contents 를 먼저 삭제한다. */
    long deleteByMarketId(Long marketId);
}

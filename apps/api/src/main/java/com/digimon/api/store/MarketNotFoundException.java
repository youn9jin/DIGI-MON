package com.digimon.api.store;

/**
 * 점포 등록 시 해당 유저의 market 이 존재하지 않는 경우.
 * POST /api/stores 에서 409 Conflict (MARKET_NOT_FOUND) 반환용.
 */
public class MarketNotFoundException extends RuntimeException {

    public MarketNotFoundException(String message) {
        super(message);
    }
}

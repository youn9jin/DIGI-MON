package com.digimon.api.store;

/**
 * 점포 조회 시 storeId 에 해당하는 레코드가 없는 경우.
 * GET /api/stores/{storeId} 에서 404 Not Found (STORE_NOT_FOUND) 반환용.
 */
public class StoreNotFoundException extends RuntimeException {

    public StoreNotFoundException(String message) {
        super(message);
    }
}

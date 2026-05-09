package com.digimon.api.store;

/**
 * 한 시장에 등록 가능한 점포 수(150) 초과 시.
 * POST /api/stores 에서 400 Bad Request (TOO_MANY_STORES) 반환용.
 */
public class TooManyStoresException extends RuntimeException {

    private final long currentCount;
    private final int requestedCount;
    private final int maxAllowed;

    public TooManyStoresException(long currentCount, int requestedCount, int maxAllowed) {
        super("점포 수가 한도를 초과했습니다. (현재 " + currentCount
                + " + 요청 " + requestedCount + " > 한도 " + maxAllowed + ")");
        this.currentCount = currentCount;
        this.requestedCount = requestedCount;
        this.maxAllowed = maxAllowed;
    }

    public long getCurrentCount() {
        return currentCount;
    }

    public int getRequestedCount() {
        return requestedCount;
    }

    public int getMaxAllowed() {
        return maxAllowed;
    }
}

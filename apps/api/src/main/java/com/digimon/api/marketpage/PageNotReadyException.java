package com.digimon.api.marketpage;

/**
 * GET /api/market/page/{pageId} 호출 시 페이지 생성이 아직 완료되지 않았을 때(status != DONE).
 * GlobalExceptionHandler 에서 409 CONFLICT + code "PAGE_NOT_READY" 로 매핑한다.
 */
public class PageNotReadyException extends RuntimeException {

    public PageNotReadyException(String message) {
        super(message);
    }
}

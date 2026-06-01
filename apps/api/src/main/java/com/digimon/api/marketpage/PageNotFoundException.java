package com.digimon.api.marketpage;

/**
 * GET /api/market/page/status/{pageId} 에서 pageId 에 해당하는 market_pages row 가 없을 때.
 * GlobalExceptionHandler 에서 404 NOT_FOUND + code "PAGE_NOT_FOUND" 로 매핑.
 */
public class PageNotFoundException extends RuntimeException {

    public PageNotFoundException(String message) {
        super(message);
    }
}

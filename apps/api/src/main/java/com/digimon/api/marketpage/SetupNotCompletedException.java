package com.digimon.api.marketpage;

/**
 * POST /api/market/page 트리거 시 해당 market 의 market_page_configs 설정이 없을 때
 * (= /api/market/page/setup 이 선행되지 않음).
 * GlobalExceptionHandler 에서 400 BAD_REQUEST + code "SETUP_NOT_COMPLETED" 로 매핑.
 */
public class SetupNotCompletedException extends RuntimeException {

    public SetupNotCompletedException(String message) {
        super(message);
    }
}

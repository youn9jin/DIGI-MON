package com.digimon.api.marketpage;

/**
 * POST /api/market/page 요청 시 해당 유저에 연결된 market 이 없는 경우.
 * GlobalExceptionHandler 에서 404 NOT_FOUND + code "MARKET_NOT_FOUND" 로 매핑.
 *
 * 주의: 점포(/api/stores) 도메인의 {@link com.digimon.api.store.MarketNotFoundException}
 * 은 같은 코드(MARKET_NOT_FOUND)로 409 를 반환한다. 새 엔드포인트는 404 가 사양이라
 * 별도 예외 클래스를 신설했다(Q1-B 결정 사항).
 */
public class MarketPageMarketNotFoundException extends RuntimeException {

    public MarketPageMarketNotFoundException(String message) {
        super(message);
    }
}

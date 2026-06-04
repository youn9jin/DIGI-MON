package com.digimon.api.market; // 시장 도메인 패키지를 선언한다.

/**
 * PATCH /api/market 요청의 marketType 이 허용값이 아닐 때 사용.
 */
public class InvalidMarketTypeException extends RuntimeException { // INVALID_MARKET_TYPE 응답으로 매핑할 예외다.

    public InvalidMarketTypeException(String message) { // 예외 메시지를 받는 생성자다.
        super(message); // 상위 RuntimeException 에 메시지를 전달한다.
    }
}

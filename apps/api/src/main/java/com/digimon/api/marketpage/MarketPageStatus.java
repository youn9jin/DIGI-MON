package com.digimon.api.marketpage;

/**
 * 시장 페이지 비동기 생성 상태.
 * DB 의 market_pages.status 컬럼에 문자열로 저장 (@Enumerated(EnumType.STRING)).
 *
 * - PENDING : 클라이언트 요청 직후. 백그라운드에서 FastAPI 호출 중.
 * - DONE    : FastAPI 응답 수신 + content_json 저장 완료.
 * - FAILED  : FastAPI 호출 실패 / 타임아웃 / 5분 초과 stale 정리.
 */
public enum MarketPageStatus {
    PENDING,
    DONE,
    FAILED
}

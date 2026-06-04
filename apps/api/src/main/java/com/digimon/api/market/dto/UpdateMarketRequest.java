package com.digimon.api.market.dto; // 시장 수정 요청 DTO 패키지를 선언한다.

import lombok.Getter; // 요청 필드 getter 생성을 위해 Lombok Getter 를 가져온다.
import lombok.NoArgsConstructor; // Jackson 역직렬화를 위한 기본 생성자 생성을 위해 가져온다.
import lombok.Setter; // 요청 필드 setter 생성을 위해 Lombok Setter 를 가져온다.

/**
 * PATCH /api/market 요청 본문.
 *
 * null 필드는 기존 값을 유지하므로 Bean Validation 대신 Service 에서 선택적으로 검증한다.
 */
@Getter // 각 필드의 getter 를 생성한다.
@Setter // 각 필드의 setter 를 생성한다.
@NoArgsConstructor // JSON 요청 본문 역직렬화에 필요한 기본 생성자를 생성한다.
public class UpdateMarketRequest { // 시장 기본 정보 수정 요청을 표현한다.

    /** 시장명이다. */
    private String name; // markets.name 컬럼으로 저장한다.

    /** 시장 주소다. */
    private String address; // markets.address 컬럼으로 저장한다.

    /** 시장 유형이다. */
    private String marketType; // markets.market_type 컬럼으로 저장한다.

    /** 전체 점포 수 구간이다. */
    private String totalStores; // markets.total_stores 컬럼으로 저장한다.

    /** 운영 시간 객체다. */
    private UpdateMarketOperatingHours operatingHours; // markets.operating_hours 컬럼에 JSON 문자열로 저장한다.

    /** 주요 고객층이다. */
    private String targetCustomers; // markets.target_customers 컬럼으로 저장한다.

    /** 시장 연락처다. */
    private String contact; // markets.contact 컬럼으로 저장한다.
}

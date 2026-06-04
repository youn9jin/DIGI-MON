package com.digimon.api.market.dto; // 시장 수정 요청 DTO 패키지를 선언한다.

import lombok.Getter; // 요청 필드 getter 생성을 위해 Lombok Getter 를 가져온다.
import lombok.NoArgsConstructor; // Jackson 역직렬화를 위한 기본 생성자 생성을 위해 가져온다.
import lombok.Setter; // 요청 필드 setter 생성을 위해 Lombok Setter 를 가져온다.

/**
 * PATCH /api/market 요청의 operatingHours 중첩 객체.
 */
@Getter // 각 필드의 getter 를 생성한다.
@Setter // 각 필드의 setter 를 생성한다.
@NoArgsConstructor // JSON 요청 본문 역직렬화에 필요한 기본 생성자를 생성한다.
public class UpdateMarketOperatingHours { // operatingHours 요청 객체를 표현한다.

    /** 평일 운영 시간 문자열이다. */
    private String weekday; // markets.operating_hours JSON 의 weekday 값으로 저장한다.

    /** 주말 운영 시간 문자열이며 null 이면 일요일 미운영 의미로 저장한다. */
    private String weekend; // markets.operating_hours JSON 의 weekend 값으로 저장한다.
}

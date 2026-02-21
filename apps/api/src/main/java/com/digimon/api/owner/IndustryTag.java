package com.digimon.api.owner;

/** 업종 태그 (UI 6개 기준). DB business_type은 varchar로 저장됨. */
public enum IndustryTag {
    ELECTRONICS_MANUFACTURING,   // 제조업
    WHOLESALE_RETAIL,            // 도매 및 소매업
    ACCOMMODATION_FOOD,          // 숙박 및 음식점업
    CONSTRUCTION,                // 건설업
    INFORMATION_COMMUNICATION,   // 정보통신업
    ARTS_SPORTS_LEISURE          // 예술·스포츠·여가
}

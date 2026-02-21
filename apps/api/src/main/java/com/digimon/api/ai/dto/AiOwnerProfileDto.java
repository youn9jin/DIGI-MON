package com.digimon.api.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** AI FINALIZE 요청용. owner_profiles 테이블에서 조립. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiOwnerProfileDto {

    private String storeName;
    /** industryTag. DB business_type 매핑 */
    private String industryTag;
    private String ageGroup;
    private AiLocationDto location;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiLocationDto {
        private String countryCode;
        private String adminArea;
    }
}

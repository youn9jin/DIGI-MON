package com.digimon.api.store.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * PATCH /api/stores/{storeId} 요청 바디.
 *
 * 모든 필드는 optional. null 이면 미변경(partial update).
 * 검증 규칙은 POST 의 점포 검증 규칙(StoresService 내부)과 동일하지만, name/category 는
 * "값이 들어왔을 때만" 검증한다(POST 는 필수).
 *
 * 빈 문자열 정책 (자체 결정):
 * - name/category 가 trim 후 빈 문자열이면 400 VALIDATION_ERROR.
 *   (NOT NULL 컬럼이라 빈 값으로 업데이트 불가)
 * - 그 외 선택 필드는 trim 후 빈 문자열이면 null 로 정규화하여 "값 지우기" 의미로 업데이트.
 *
 * Bean Validation 어노테이션은 의도적으로 부착하지 않는다.
 * 모든 검증은 StoresService 가 수동 수행하며, 위반 사항은 ValidationErrorException 으로
 * 누적 반환된다(클라이언트가 한 번에 모든 에러를 받을 수 있도록).
 */
@Getter
@Setter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UpdateStoreRequest {

    private String name;
    private String category;
    private String items;
    private String operatingHours;
    private String yearsOfOperation;
    private String contact;
    private String description;
}

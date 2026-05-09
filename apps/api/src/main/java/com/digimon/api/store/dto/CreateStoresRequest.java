package com.digimon.api.store.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * POST /api/stores 요청 바디.
 *
 * stores 자체가 null/빈 배열인 경우만 컨트롤러 진입을 차단(@Valid → 400 VALIDATION_ERROR).
 * 개별 원소 검증은 부분 성공 정책에 따라 StoresService 가 수동 처리한다.
 */
@Getter
@Setter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CreateStoresRequest {

    @NotNull(message = "stores is required")
    @NotEmpty(message = "stores must contain at least 1 item")
    private List<StoreItemRequest> stores;
}

package com.digimon.api.store.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * POST /api/stores 의 stores 배열 원소.
 *
 * 부분 성공 정책상 한 점포의 검증 실패가 다른 점포 INSERT 를 막으면 안 되므로
 * Bean Validation(@NotBlank, @Size 등) 어노테이션은 의도적으로 부착하지 않는다.
 * 모든 검증은 StoresService 에서 점포별로 수행하며, 첫 실패 사유만 failedItems[i].reason 으로 반환한다.
 */
@Getter
@Setter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StoreItemRequest {

    private String name;
    private String category;
    private String items;
    private String operatingHours;
    private String yearsOfOperation;
    private String contact;
    private String description;

    @Size(max = 4, message = "storeImageUrls는 최대 4개까지 등록 가능합니다.")
    private List<String> storeImageUrls = new ArrayList<>();

    @Size(max = 2, message = "menuImageUrls는 최대 2개까지 등록 가능합니다.")
    private List<String> menuImageUrls = new ArrayList<>();

    @Size(max = 4, message = "productImageUrls는 최대 4개까지 등록 가능합니다.")
    private List<String> productImageUrls = new ArrayList<>();
}

package com.digimon.api.user.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AssociationInfoResponse {
    private String managerName;
    private String email;
    private String phone;
    private String fax;
    private String managerTitle;
}

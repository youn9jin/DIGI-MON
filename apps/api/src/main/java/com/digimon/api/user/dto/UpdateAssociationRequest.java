package com.digimon.api.user.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UpdateAssociationRequest {

    @Size(min = 1, max = 50, message = "담당자 이름은 50자 이내여야 합니다.")
    private String managerName;

    @Email(message = "이메일 형식이 올바르지 않습니다.")
    @Size(max = 100, message = "이메일은 100자 이내여야 합니다.")
    private String email;

    @Pattern(regexp = "^[0-9+\\-() ]{5,20}$", message = "전화번호 형식이 올바르지 않습니다.")
    private String phone;

    @Pattern(regexp = "^[0-9+\\-() ]{5,20}$", message = "팩스 번호 형식이 올바르지 않습니다.")
    private String fax;

    @Size(min = 1, max = 50, message = "담당자 직책은 50자 이내여야 합니다.")
    private String managerTitle;
}

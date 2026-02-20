package com.digimon.api.owner;

import com.digimon.api.auth.UnauthorizedException;
import com.digimon.api.owner.dto.OwnerOnboardingRequest;
import com.digimon.api.owner.dto.OwnerOnboardingResponse;
import com.digimon.api.owner.dto.OwnerOnboardingResult;
import com.digimon.api.owner.dto.OwnerProfileResponse;
import com.digimon.api.owner.dto.LocationResponse;
import com.digimon.api.user.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OwnerOnboardingController.class)
@AutoConfigureMockMvc(addFilters = false)
class OwnerOnboardingControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockBean
    OwnerOnboardingService ownerOnboardingService;

    private static final String VALID_BODY = """
            {
              "industryTag": "ACCOMMODATION_FOOD",
              "ageGroup": "AGE_20S",
              "storeName": "민들레 김밥",
              "location": { "countryCode": "KR", "adminArea": "서울특별시 강남구" }
            }""";

    @Test
    @DisplayName("Authorization 없으면 401 UNAUTHORIZED")
    void onboard_noAuth_returns401() throws Exception {
        doThrow(new UnauthorizedException("Invalid or missing token"))
                .when(ownerOnboardingService).resolveCurrentUser(isNull());

        mockMvc.perform(post("/api/owners/onboarding")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("필수값 누락 시 400 VALIDATION_ERROR")
    void onboard_missingRequired_returns400() throws Exception {
        mockMvc.perform(post("/api/owners/onboarding")
                        .header("Authorization", "Bearer any-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"industryTag\":\"ACCOMMODATION_FOOD\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("최초 온보딩 생성 시 201 Created")
    void onboard_created_returns201() throws Exception {
        User user = new User();
        user.setId(12L);
        OwnerOnboardingResponse response = new OwnerOnboardingResponse(
                12L,
                "OWNER",
                true,
                new OwnerProfileResponse(
                        "민들레 김밥",
                        "ACCOMMODATION_FOOD",
                        "AGE_20S",
                        new LocationResponse("KR", "서울특별시 강남구"),
                        null
                )
        );
        when(ownerOnboardingService.resolveCurrentUser(any())).thenReturn(user);
        when(ownerOnboardingService.onboardOwner(any(User.class), any(OwnerOnboardingRequest.class)))
                .thenReturn(new OwnerOnboardingResult(true, response));

        mockMvc.perform(post("/api/owners/onboarding")
                        .header("Authorization", "Bearer any-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.userId").value(12))
                .andExpect(jsonPath("$.data.role").value("OWNER"))
                .andExpect(jsonPath("$.data.onboarded").value(true))
                .andExpect(jsonPath("$.data.ownerProfile.storeName").value("민들레 김밥"))
                .andExpect(jsonPath("$.data.ownerProfile.industryTag").value("ACCOMMODATION_FOOD"))
                .andExpect(jsonPath("$.data.ownerProfile.location.countryCode").value("KR"));
    }

    @Test
    @DisplayName("재저장(업데이트) 시 200 OK")
    void onboard_updated_returns200() throws Exception {
        User user = new User();
        user.setId(12L);
        OwnerOnboardingResponse response = new OwnerOnboardingResponse(
                12L,
                "OWNER",
                true,
                new OwnerProfileResponse(
                        "민들레 김밥",
                        "ACCOMMODATION_FOOD",
                        "AGE_20S",
                        new LocationResponse("KR", "서울특별시 강남구"),
                        null
                )
        );
        when(ownerOnboardingService.resolveCurrentUser(any())).thenReturn(user);
        when(ownerOnboardingService.onboardOwner(any(User.class), any(OwnerOnboardingRequest.class)))
                .thenReturn(new OwnerOnboardingResult(false, response));

        mockMvc.perform(post("/api/owners/onboarding")
                        .header("Authorization", "Bearer any-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.userId").value(12));
    }
}

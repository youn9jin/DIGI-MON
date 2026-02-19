package com.digimon.api.plandraft;

import com.digimon.api.plandraft.dto.CreatePlanDraftResponse;
import com.digimon.api.plandraft.dto.InitialPlanDto;
import com.digimon.api.plandraft.dto.PrimaryActionDto;
import com.digimon.api.plandraft.dto.SurveyDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PlanDraftController.class)
@AutoConfigureMockMvc(addFilters = false)
class PlanDraftControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockBean
    PlanDraftService planDraftService;

    @Test
    @DisplayName("survey 누락 시 400 VALIDATION_ERROR")
    void createPlanDraft_missingSurvey_returns400() throws Exception {
        String body = "{}";
        mockMvc.perform(post("/api/plan-drafts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data").value((Object) null))
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.error.message").value("Invalid request body"))
                .andExpect(jsonPath("$.error.details").isArray());
    }

    @Test
    @DisplayName("유효한 요청 시 201 및 success/data 반환")
    void createPlanDraft_validRequest_returns201() throws Exception {
        CreatePlanDraftResponse response = new CreatePlanDraftResponse(
                "uuid-guest-123",
                101L,
                "uuid-token-abc",
                OffsetDateTime.now().plusHours(24),
                DigitalLevel.LEVEL0,
                new InitialPlanDto(new PrimaryActionDto(
                        "GOOGLE_MAPS_REGISTER",
                        "구글 지도에 가게 등록하기",
                        "근처 검색 유입을 늘리기 위한 첫 단계예요",
                        10
                ))
        );
        when(planDraftService.createDraft(eq(null), any(SurveyDto.class)))
                .thenReturn(response);

        Map<String, Object> request = Map.of(
                "survey", Map.of(
                        "q1MapSearchable", "NOT_FOUND",
                        "q2MapInfoAccurate", "NONE_OR_UNKNOWN",
                        "q3MenuVisible", "BARELY",
                        "q4ContactChannel", "NO_CHANNEL",
                        "q5PrimaryGoal", "INCREASE_ACCESSIBILITY"
                )
        );

        mockMvc.perform(post("/api/plan-drafts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.guestKey").value("uuid-guest-123"))
                .andExpect(jsonPath("$.data.draftId").value(101))
                .andExpect(jsonPath("$.data.attachToken").value("uuid-token-abc"))
                .andExpect(jsonPath("$.data.digitalLevel").value("LEVEL0"))
                .andExpect(jsonPath("$.data.initialPlan.primaryAction.actionCode").value("GOOGLE_MAPS_REGISTER"))
                .andExpect(jsonPath("$.error").value((Object) null));
    }

    @Test
    @DisplayName("잘못된 enum 값 시 400 VALIDATION_ERROR")
    void createPlanDraft_invalidEnum_returns400() throws Exception {
        Map<String, Object> request = Map.of(
                "survey", Map.of(
                        "q1MapSearchable", "INVALID_VALUE",
                        "q2MapInfoAccurate", "NONE_OR_UNKNOWN",
                        "q3MenuVisible", "BARELY",
                        "q4ContactChannel", "NO_CHANNEL",
                        "q5PrimaryGoal", "INCREASE_ACCESSIBILITY"
                )
        );
        mockMvc.perform(post("/api/plan-drafts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
    }
}

package com.digimon.api.plandraft;

import com.digimon.api.auth.UnauthorizedException;
import com.digimon.api.plandraft.dto.AttachRequest;
import com.digimon.api.plandraft.dto.AttachResponse;
import com.digimon.api.plandraft.dto.CreatePlanDraftResponse;
import com.digimon.api.plandraft.dto.InitialPlanDto;
import com.digimon.api.plandraft.dto.PrimaryActionDto;
import com.digimon.api.plandraft.dto.SurveyDto;
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

import java.time.OffsetDateTime;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doThrow;
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

    @MockBean
    PlanDraftAttachService planDraftAttachService;

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

    // --- POST /api/plan-drafts/{draftId}/attach ---

    @Test
    @DisplayName("attach: Authorization 없으면 401 UNAUTHORIZED")
    void attach_noAuth_returns401() throws Exception {
        doThrow(new UnauthorizedException("Invalid or missing token"))
                .when(planDraftAttachService).resolveCurrentUser(isNull());

        mockMvc.perform(post("/api/plan-drafts/1/attach")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"attachToken\":\"valid-token\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("attach: attachToken blank면 400 VALIDATION_ERROR")
    void attach_blankToken_returns400() throws Exception {
        User user = new User();
        user.setId(1L);
        when(planDraftAttachService.resolveCurrentUser(any())).thenReturn(user);

        mockMvc.perform(post("/api/plan-drafts/1/attach")
                        .header("Authorization", "Bearer any-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"attachToken\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("attach: draft 없으면 404 DRAFT_NOT_FOUND")
    void attach_draftNotFound_returns404() throws Exception {
        User user = new User();
        user.setId(1L);
        when(planDraftAttachService.resolveCurrentUser(any())).thenReturn(user);
        when(planDraftAttachService.attach(eq(999L), any(AttachRequest.class), eq(user)))
                .thenThrow(new DraftNotFoundException(999L));

        mockMvc.perform(post("/api/plan-drafts/999/attach")
                        .header("Authorization", "Bearer any-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"attachToken\":\"valid-token\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("DRAFT_NOT_FOUND"));
    }

    @Test
    @DisplayName("attach: 성공 시 200 및 draftId, attached:true")
    void attach_success_returns200() throws Exception {
        User user = new User();
        user.setId(1L);
        when(planDraftAttachService.resolveCurrentUser(any())).thenReturn(user);
        when(planDraftAttachService.attach(eq(101L), any(AttachRequest.class), eq(user)))
                .thenReturn(new AttachResponse(101L, true));

        mockMvc.perform(post("/api/plan-drafts/101/attach")
                        .header("Authorization", "Bearer any-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"attachToken\":\"valid-token\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.draftId").value(101))
                .andExpect(jsonPath("$.data.attached").value(true))
                .andExpect(jsonPath("$.error").value((Object) null));
    }

    @Test
    @DisplayName("attach: 이미 다른 유저에게 붙어 있으면 409 DRAFT_ALREADY_ATTACHED")
    void attach_alreadyAttachedToOther_returns409() throws Exception {
        User user = new User();
        user.setId(1L);
        when(planDraftAttachService.resolveCurrentUser(any())).thenReturn(user);
        when(planDraftAttachService.attach(eq(101L), any(AttachRequest.class), eq(user)))
                .thenThrow(new DraftAlreadyAttachedException());

        mockMvc.perform(post("/api/plan-drafts/101/attach")
                        .header("Authorization", "Bearer any-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"attachToken\":\"valid-token\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("DRAFT_ALREADY_ATTACHED"));
    }

    @Test
    @DisplayName("attach: 토큰 무효/만료/이미 사용이면 409 ATTACH_TOKEN_INVALID_OR_EXPIRED")
    void attach_invalidToken_returns409() throws Exception {
        User user = new User();
        user.setId(1L);
        when(planDraftAttachService.resolveCurrentUser(any())).thenReturn(user);
        when(planDraftAttachService.attach(eq(101L), any(AttachRequest.class), eq(user)))
                .thenThrow(new AttachTokenInvalidOrExpiredException());

        mockMvc.perform(post("/api/plan-drafts/101/attach")
                        .header("Authorization", "Bearer any-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"attachToken\":\"wrong-token\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("ATTACH_TOKEN_INVALID_OR_EXPIRED"));
    }
}

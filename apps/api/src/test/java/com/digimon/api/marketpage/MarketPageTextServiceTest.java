package com.digimon.api.marketpage;

import com.digimon.api.market.Market;
import com.digimon.api.market.MarketRepository;
import com.digimon.api.marketpage.dto.UpdateMarketPageTextRequest;
import com.digimon.api.user.User;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MarketPageTextServiceTest {

    @Mock
    MarketRepository marketRepository;

    @Mock
    MarketPageRepository marketPageRepository;

    @Mock
    MarketPageConfigRepository marketPageConfigRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    MarketPageTextService marketPageTextService;

    User user;

    Market market;

    MarketPage donePage;

    @BeforeEach
    void setUp() {
        marketPageTextService = new MarketPageTextService(
                marketRepository,
                marketPageRepository,
                marketPageConfigRepository,
                objectMapper);

        user = new User();
        user.setId(1L);

        market = new Market();
        market.setId(10L);
        market.setUser(user);

        donePage = new MarketPage();
        donePage.setId(100L);
        donePage.setMarket(market);
        donePage.setTemplateType("TEMPLATE_1");
        donePage.setStatus(MarketPageStatus.DONE);
        donePage.setContentJson("""
                {
                  "hero": {"title": "기존 제목", "subtitle": "기존 부제", "description": "기존 설명"},
                  "intro": {"content": "기존 소개"},
                  "features": [
                    {"title": "첫 번째", "description": "기존 설명 1"},
                    {"title": "두 번째", "description": "기존 설명 2"}
                  ],
                  "store_highlights": [{"store_name": "상점", "highlight": "유지"}],
                  "cta": {"text": "유지"},
                  "future_key": {"nested": true}
                }
                """);

        when(marketRepository.findByUserId(user.getId())).thenReturn(Optional.of(market));
        when(marketPageRepository.findByMarketIdAndStatus(market.getId(), MarketPageStatus.PENDING))
                .thenReturn(Optional.empty());
        lenient().when(marketPageRepository.findByMarketIdAndStatus(market.getId(), MarketPageStatus.DONE))
                .thenReturn(Optional.of(donePage));
    }

    @Test
    @DisplayName("content_json은 요청된 키만 바꾸고 기존 키를 보존한다")
    void updateText_contentJsonSurgery_preservesOtherKeys() throws Exception {
        UpdateMarketPageTextRequest request = request();
        request.setHeroSubtitle("새 부제");
        request.setFeature1Description("새 설명 1");

        MarketPageTextService.Result result = marketPageTextService.updateText(user, request);

        JsonNode root = objectMapper.readTree(donePage.getContentJson());
        assertThat(root.path("hero").path("subtitle").asText()).isEqualTo("새 부제");
        assertThat(root.path("intro").path("content").asText()).isEqualTo("기존 소개");
        assertThat(root.path("features").get(0).path("description").asText()).isEqualTo("새 설명 1");
        assertThat(root.path("features").get(1).path("description").asText()).isEqualTo("기존 설명 2");
        assertThat(root.path("store_highlights").get(0).path("highlight").asText()).isEqualTo("유지");
        assertThat(root.path("cta").path("text").asText()).isEqualTo("유지");
        assertThat(root.path("future_key").path("nested").asBoolean()).isTrue();
        assertThat(result.getMarketId()).isEqualTo(10L);
        assertThat(result.getUpdatedFields()).containsExactly("heroSubtitle", "feature1Description");
        verify(marketPageRepository).save(donePage);
        verify(marketPageConfigRepository, never()).save(any());
    }

    @Test
    @DisplayName("config가 있으면 요청된 텍스트 컬럼만 수정한다")
    void updateText_existingConfig_updatesOnlyRequestedColumns() {
        MarketPageConfig config = MarketPageConfig.builder()
                .market(market)
                .templateType("TEMPLATE_2")
                .selectedSections(List.of("intro", "history"))
                .historyText("기존 역사")
                .directionsText("기존 길찾기")
                .heroImageUrl("hero.png")
                .build();
        when(marketPageConfigRepository.findByMarketId(market.getId())).thenReturn(Optional.of(config));

        UpdateMarketPageTextRequest request = request();
        request.setDirectionsText("새 길찾기");

        MarketPageTextService.Result result = marketPageTextService.updateText(user, request);

        assertThat(config.getHistoryText()).isEqualTo("기존 역사");
        assertThat(config.getDirectionsText()).isEqualTo("새 길찾기");
        assertThat(config.getTemplateType()).isEqualTo("TEMPLATE_2");
        assertThat(config.getSelectedSections()).containsExactly("intro", "history");
        assertThat(config.getHeroImageUrl()).isEqualTo("hero.png");
        assertThat(result.getUpdatedFields()).containsExactly("directionsText");
        verify(marketPageConfigRepository).save(config);
        verify(marketPageRepository, never()).save(any());
    }

    @Test
    @DisplayName("config가 없으면 DONE 페이지 템플릿과 빈 selectedSections로 생성한다")
    void updateText_missingConfig_insertsDefensiveConfig() {
        when(marketPageConfigRepository.findByMarketId(market.getId())).thenReturn(Optional.empty());
        UpdateMarketPageTextRequest request = request();
        request.setHistoryText("새 역사");

        marketPageTextService.updateText(user, request);

        ArgumentCaptor<MarketPageConfig> captor = ArgumentCaptor.forClass(MarketPageConfig.class);
        verify(marketPageConfigRepository).save(captor.capture());
        MarketPageConfig saved = captor.getValue();
        assertThat(saved.getMarket()).isSameAs(market);
        assertThat(saved.getTemplateType()).isEqualTo("TEMPLATE_1");
        assertThat(saved.getSelectedSections()).isEmpty();
        assertThat(saved.getHistoryText()).isEqualTo("새 역사");
    }

    @Test
    @DisplayName("features[1]이 없으면 CONTENT_PARSE_ERROR를 반환한다")
    void updateText_missingSecondFeature_throwsContentParseError() {
        donePage.setContentJson("""
                {"hero": {}, "intro": {}, "features": [{"description": "첫 번째"}]}
                """);
        UpdateMarketPageTextRequest request = request();
        request.setFeature2Description("새 설명");

        assertThatThrownBy(() -> marketPageTextService.updateText(user, request))
                .isInstanceOf(ContentParseErrorException.class)
                .hasMessageContaining("features[1]");

        verify(marketPageRepository, never()).save(any());
    }

    @Test
    @DisplayName("features 배열이 비어 있으면 CONTENT_PARSE_ERROR를 반환한다")
    void updateText_emptyFeatures_throwsContentParseError() {
        donePage.setContentJson("""
                {"hero": {}, "intro": {}, "features": []}
                """);
        UpdateMarketPageTextRequest request = request();
        request.setFeature1Description("새 설명");

        assertThatThrownBy(() -> marketPageTextService.updateText(user, request))
                .isInstanceOf(ContentParseErrorException.class)
                .hasMessageContaining("features[0]");

        verify(marketPageRepository, never()).save(any());
    }

    @Test
    @DisplayName("모든 필드가 null이면 NO_FIELDS_TO_UPDATE를 반환한다")
    void updateText_allFieldsNull_throwsNoFieldsToUpdate() {
        assertThatThrownBy(() -> marketPageTextService.updateText(user, request()))
                .isInstanceOf(NoFieldsToUpdateException.class);
    }

    @Test
    @DisplayName("글자 수 제한을 넘으면 초과 필드명을 포함한 FIELD_TOO_LONG을 반환한다")
    void updateText_fieldTooLong_throwsFieldTooLong() {
        UpdateMarketPageTextRequest request = request();
        request.setHeroSubtitle("가".repeat(51));

        assertThatThrownBy(() -> marketPageTextService.updateText(user, request))
                .isInstanceOf(FieldTooLongException.class)
                .hasMessageContaining("heroSubtitle");
    }

    @Test
    @DisplayName("PENDING 페이지가 있으면 ALREADY_IN_PROGRESS를 반환한다")
    void updateText_pendingPage_throwsAlreadyInProgress() {
        when(marketPageRepository.findByMarketIdAndStatus(market.getId(), MarketPageStatus.PENDING))
                .thenReturn(Optional.of(new MarketPage()));

        UpdateMarketPageTextRequest request = request();
        request.setHistoryText("새 역사");

        assertThatThrownBy(() -> marketPageTextService.updateText(user, request))
                .isInstanceOf(AlreadyInProgressException.class);
    }

    /** 모든 필드가 null 인 기본 요청을 생성한다. */
    private static UpdateMarketPageTextRequest request() {
        return new UpdateMarketPageTextRequest();
    }
}

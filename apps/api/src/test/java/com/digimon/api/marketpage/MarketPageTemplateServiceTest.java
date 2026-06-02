package com.digimon.api.marketpage;

import com.digimon.api.market.Market;
import com.digimon.api.market.MarketRepository;
import com.digimon.api.marketpage.dto.UpdateMarketPageTemplateRequest;
import com.digimon.api.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MarketPageTemplateServiceTest {

    @Mock
    MarketRepository marketRepository;

    @Mock
    MarketPageRepository marketPageRepository;

    @Mock
    MarketPageConfigRepository marketPageConfigRepository;

    MarketPageTemplateService marketPageTemplateService;

    User user;

    Market market;

    MarketPage donePage;

    MarketPageConfig config;

    @BeforeEach
    void setUp() {
        marketPageTemplateService = new MarketPageTemplateService(
                marketRepository,
                marketPageRepository,
                marketPageConfigRepository);

        user = new User();
        user.setId(1L);

        market = new Market();
        market.setId(10L);
        market.setUser(user);

        donePage = new MarketPage();
        donePage.setId(100L);
        donePage.setMarket(market);
        donePage.setStatus(MarketPageStatus.DONE);
        donePage.setTemplateType("TEMPLATE_1");
        donePage.setContentJson("{\"hero\":{\"subtitle\":\"유지\"}}");

        config = MarketPageConfig.builder()
                .market(market)
                .templateType("TEMPLATE_1")
                .selectedSections(List.of("intro"))
                .build();
    }

    @Test
    @DisplayName("TEMPLATE_1에서 TEMPLATE_2로 교체하면 두 테이블을 함께 저장한다")
    void updateTemplate_changesBothTables() {
        stubReadyPage();

        MarketPageTemplateService.Result result =
                marketPageTemplateService.updateTemplate(user, request("TEMPLATE_2"));

        assertThat(config.getTemplateType()).isEqualTo("TEMPLATE_2");
        assertThat(donePage.getTemplateType()).isEqualTo("TEMPLATE_2");
        assertThat(donePage.getContentJson()).isEqualTo("{\"hero\":{\"subtitle\":\"유지\"}}");
        assertThat(result.getMarketId()).isEqualTo(10L);
        assertThat(result.getTemplateType()).isEqualTo("TEMPLATE_2");
        verify(marketPageConfigRepository).save(config);
        verify(marketPageRepository).save(donePage);
    }

    @Test
    @DisplayName("동일 templateType 요청도 두 테이블을 저장하고 성공한다")
    void updateTemplate_sameTemplateType_savesIdempotently() {
        stubReadyPage();

        MarketPageTemplateService.Result result =
                marketPageTemplateService.updateTemplate(user, request("TEMPLATE_1"));

        assertThat(result.getTemplateType()).isEqualTo("TEMPLATE_1");
        verify(marketPageConfigRepository).save(config);
        verify(marketPageRepository).save(donePage);
    }

    @Test
    @DisplayName("허용되지 않은 templateType은 DB 조회 없이 INVALID_TEMPLATE_TYPE을 반환한다")
    void updateTemplate_invalidTemplateType_throwsBeforeDatabaseAccess() {
        assertThatThrownBy(() -> marketPageTemplateService.updateTemplate(user, request("UNKNOWN")))
                .isInstanceOf(InvalidTemplateTypeException.class);

        verifyNoInteractions(marketRepository, marketPageRepository, marketPageConfigRepository);
    }

    @Test
    @DisplayName("PENDING 페이지가 있으면 ALREADY_IN_PROGRESS를 반환한다")
    void updateTemplate_pendingPage_throwsAlreadyInProgress() {
        when(marketRepository.findByUserId(user.getId())).thenReturn(Optional.of(market));
        when(marketPageRepository.findByMarketIdAndStatus(market.getId(), MarketPageStatus.PENDING))
                .thenReturn(Optional.of(new MarketPage()));

        assertThatThrownBy(() -> marketPageTemplateService.updateTemplate(user, request("TEMPLATE_2")))
                .isInstanceOf(AlreadyInProgressException.class);

        verify(marketPageRepository, never()).save(donePage);
        verifyNoInteractions(marketPageConfigRepository);
    }

    @Test
    @DisplayName("DONE 페이지가 없으면 PAGE_NOT_FOUND를 반환한다")
    void updateTemplate_missingDonePage_throwsPageNotFound() {
        when(marketRepository.findByUserId(user.getId())).thenReturn(Optional.of(market));
        when(marketPageRepository.findByMarketIdAndStatus(market.getId(), MarketPageStatus.PENDING))
                .thenReturn(Optional.empty());
        when(marketPageRepository.findByMarketIdAndStatus(market.getId(), MarketPageStatus.DONE))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> marketPageTemplateService.updateTemplate(user, request("TEMPLATE_2")))
                .isInstanceOf(PageNotFoundException.class);

        verifyNoInteractions(marketPageConfigRepository);
    }

    @Test
    @DisplayName("요청자 소유 market이 없으면 MARKET_NOT_FOUND를 반환한다")
    void updateTemplate_missingMarket_throwsMarketNotFound() {
        when(marketRepository.findByUserId(user.getId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> marketPageTemplateService.updateTemplate(user, request("TEMPLATE_2")))
                .isInstanceOf(MarketPageMarketNotFoundException.class);

        verifyNoInteractions(marketPageRepository, marketPageConfigRepository);
    }

    @Test
    @DisplayName("config가 없으면 비정상 페이지로 보고 PAGE_NOT_FOUND를 반환한다")
    void updateTemplate_missingConfig_throwsPageNotFound() {
        when(marketRepository.findByUserId(user.getId())).thenReturn(Optional.of(market));
        when(marketPageRepository.findByMarketIdAndStatus(market.getId(), MarketPageStatus.PENDING))
                .thenReturn(Optional.empty());
        when(marketPageRepository.findByMarketIdAndStatus(market.getId(), MarketPageStatus.DONE))
                .thenReturn(Optional.of(donePage));
        when(marketPageConfigRepository.findByMarketId(market.getId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> marketPageTemplateService.updateTemplate(user, request("TEMPLATE_2")))
                .isInstanceOf(PageNotFoundException.class);

        verify(marketPageRepository, never()).save(donePage);
    }

    /** 정상 갱신에 필요한 market, PENDING 부재, DONE 페이지, config 조회를 준비한다. */
    private void stubReadyPage() {
        when(marketRepository.findByUserId(user.getId())).thenReturn(Optional.of(market));
        when(marketPageRepository.findByMarketIdAndStatus(market.getId(), MarketPageStatus.PENDING))
                .thenReturn(Optional.empty());
        when(marketPageRepository.findByMarketIdAndStatus(market.getId(), MarketPageStatus.DONE))
                .thenReturn(Optional.of(donePage));
        when(marketPageConfigRepository.findByMarketId(market.getId())).thenReturn(Optional.of(config));
    }

    /** 단일 templateType 요청 DTO 를 생성한다. */
    private static UpdateMarketPageTemplateRequest request(String templateType) {
        return new UpdateMarketPageTemplateRequest(templateType);
    }
}

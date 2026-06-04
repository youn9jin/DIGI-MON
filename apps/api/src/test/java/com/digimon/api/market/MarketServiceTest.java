package com.digimon.api.market; // 시장 서비스 테스트 패키지를 선언한다.

import com.digimon.api.market.dto.UpdateMarketOperatingHours; // operatingHours 요청 DTO 를 가져온다.
import com.digimon.api.market.dto.UpdateMarketRequest; // 시장 수정 요청 DTO 를 가져온다.
import com.digimon.api.marketpage.MarketPageMarketNotFoundException; // 404 MARKET_NOT_FOUND 예외를 검증하기 위해 가져온다.
import com.digimon.api.marketpage.NoFieldsToUpdateException; // 400 NO_FIELDS_TO_UPDATE 예외를 검증하기 위해 가져온다.
import com.digimon.api.user.User; // 테스트 사용자 엔티티를 만들기 위해 가져온다.
import com.fasterxml.jackson.databind.JsonNode; // 저장된 operatingHours JSON 을 검증하기 위해 가져온다.
import com.fasterxml.jackson.databind.ObjectMapper; // operatingHours JSON 파싱과 직렬화를 위해 가져온다.
import org.junit.jupiter.api.BeforeEach; // 각 테스트 전 공통 fixture 생성을 위해 가져온다.
import org.junit.jupiter.api.DisplayName; // 테스트 설명을 표시하기 위해 가져온다.
import org.junit.jupiter.api.Test; // 테스트 메서드 표시를 위해 가져온다.
import org.junit.jupiter.api.extension.ExtendWith; // Mockito 확장을 적용하기 위해 가져온다.
import org.mockito.Mock; // Mock 필드를 선언하기 위해 가져온다.
import org.mockito.junit.jupiter.MockitoExtension; // Mockito JUnit 5 확장을 가져온다.

import java.util.Optional; // repository Optional 응답을 만들기 위해 가져온다.

import static org.assertj.core.api.Assertions.assertThat; // 값 검증 fluent assertion 을 가져온다.
import static org.assertj.core.api.Assertions.assertThatThrownBy; // 예외 검증 fluent assertion 을 가져온다.
import static org.mockito.Mockito.never; // save 미호출 검증을 위해 가져온다.
import static org.mockito.Mockito.verify; // mock 호출 검증을 위해 가져온다.
import static org.mockito.Mockito.when; // mock stubbing 을 위해 가져온다.

@ExtendWith(MockitoExtension.class) // Mockito mock 초기화를 JUnit 5 확장으로 처리한다.
class MarketServiceTest { // MarketService 단위 테스트 클래스다.

    @Mock // MarketRepository 를 mock 으로 대체한다.
    MarketRepository marketRepository; // 테스트 대상 서비스의 repository 의존성이다.

    private final ObjectMapper objectMapper = new ObjectMapper(); // 실제 JSON 직렬화 동작을 검증하기 위한 ObjectMapper 다.

    MarketService marketService; // 테스트 대상 서비스다.

    User user; // 테스트 인증 사용자다.

    Market market; // 테스트 대상 시장 엔티티다.

    @BeforeEach // 각 테스트 시작 전에 실행한다.
    void setUp() { // 공통 테스트 fixture 를 만든다.
        marketService = new MarketService(marketRepository, objectMapper); // mock repository 와 실제 mapper 로 서비스를 생성한다.

        user = new User(); // 테스트 사용자를 생성한다.
        user.setId(1L); // repository 조회에 사용할 사용자 ID 를 지정한다.

        market = new Market(); // 테스트 시장을 생성한다.
        market.setId(10L); // 응답 검증에 사용할 marketId 를 지정한다.
        market.setUser(user); // 시장 소유자를 테스트 사용자로 지정한다.
        market.setName("기존 시장"); // null 유지 검증을 위한 기존 시장명을 지정한다.
        market.setAddress("기존 주소"); // null 유지 검증을 위한 기존 주소를 지정한다.
        market.setMarketType("전통시장"); // 기존 marketType 을 지정한다.
        market.setTotalStores("10개 이상 20개 미만"); // 기존 totalStores 를 지정한다.
        market.setOperatingHours("{\"weekday\":\"09:00~18:00\",\"weekend\":\"10:00~17:00\"}"); // 기존 운영시간 JSON 을 지정한다.
        market.setTargetCustomers("기존 고객"); // 기존 targetCustomers 를 지정한다.
        market.setContact("02-123-4567"); // 기존 contact 를 지정한다.

        when(marketRepository.findByUserId(user.getId())).thenReturn(Optional.of(market)); // 기본적으로 요청자 소유 시장을 반환한다.
    }

    @Test // 정상 일부 수정 케이스를 테스트한다.
    @DisplayName("정상 수정은 null이 아닌 일부 필드만 바꾸고 updatedFields를 반환한다") // 테스트 의도를 설명한다.
    void updateMarket_partialFields_updatesOnlyProvidedFields() { // 일부 필드만 수정되는지 검증한다.
        UpdateMarketRequest request = request(); // 모든 필드가 null 인 요청 객체를 만든다.
        request.setName("새 시장"); // 수정할 name 을 지정한다.
        request.setAddress("새 주소"); // 수정할 address 를 지정한다.
        request.setContact("+82 2-123-4567"); // 수정할 contact 를 지정한다.

        MarketService.Result result = marketService.updateMarket(user, request); // 시장 수정 서비스를 실행한다.

        assertThat(market.getName()).isEqualTo("새 시장"); // name 이 새 값으로 바뀌었는지 검증한다.
        assertThat(market.getAddress()).isEqualTo("새 주소"); // address 가 새 값으로 바뀌었는지 검증한다.
        assertThat(market.getMarketType()).isEqualTo("전통시장"); // null 로 보낸 marketType 이 유지됐는지 검증한다.
        assertThat(market.getOperatingHours()).isEqualTo("{\"weekday\":\"09:00~18:00\",\"weekend\":\"10:00~17:00\"}"); // null 로 보낸 operatingHours 가 유지됐는지 검증한다.
        assertThat(market.getContact()).isEqualTo("+82 2-123-4567"); // contact 가 새 값으로 바뀌었는지 검증한다.
        assertThat(result.getMarketId()).isEqualTo(10L); // 응답 marketId 를 검증한다.
        assertThat(result.getUpdatedFields()).containsExactly("name", "address", "contact"); // 수정 필드 목록과 순서를 검증한다.
        verify(marketRepository).save(market); // 변경된 시장 저장 호출을 검증한다.
    }

    @Test // 모든 필드 null 케이스를 테스트한다.
    @DisplayName("모든 필드가 null이면 NO_FIELDS_TO_UPDATE를 반환한다") // 테스트 의도를 설명한다.
    void updateMarket_allFieldsNull_throwsNoFieldsToUpdate() { // 모든 필드 null 예외를 검증한다.
        assertThatThrownBy(() -> marketService.updateMarket(user, request())) // 모든 필드 null 요청을 실행한다.
                .isInstanceOf(NoFieldsToUpdateException.class); // NO_FIELDS_TO_UPDATE 예외 타입을 검증한다.

        verify(marketRepository, never()).save(market); // 검증 실패 시 저장하지 않았는지 확인한다.
    }

    @Test // marketType 허용값 위반 케이스를 테스트한다.
    @DisplayName("marketType이 허용값이 아니면 INVALID_MARKET_TYPE을 반환한다") // 테스트 의도를 설명한다.
    void updateMarket_invalidMarketType_throwsInvalidMarketType() { // marketType 검증 예외를 확인한다.
        UpdateMarketRequest request = request(); // 요청 객체를 만든다.
        request.setMarketType("대형마트"); // 허용되지 않는 marketType 을 지정한다.

        assertThatThrownBy(() -> marketService.updateMarket(user, request)) // 잘못된 요청을 실행한다.
                .isInstanceOf(InvalidMarketTypeException.class); // INVALID_MARKET_TYPE 예외 타입을 검증한다.

        verify(marketRepository, never()).save(market); // 검증 실패 시 저장하지 않았는지 확인한다.
    }

    @Test // totalStores 허용값 위반 케이스를 테스트한다.
    @DisplayName("totalStores가 허용값이 아니면 INVALID_TOTAL_STORES를 반환한다") // 테스트 의도를 설명한다.
    void updateMarket_invalidTotalStores_throwsInvalidTotalStores() { // totalStores 검증 예외를 확인한다.
        UpdateMarketRequest request = request(); // 요청 객체를 만든다.
        request.setTotalStores("5개 미만"); // 허용되지 않는 totalStores 값을 지정한다.

        assertThatThrownBy(() -> marketService.updateMarket(user, request)) // 잘못된 요청을 실행한다.
                .isInstanceOf(InvalidTotalStoresException.class); // INVALID_TOTAL_STORES 예외 타입을 검증한다.

        verify(marketRepository, never()).save(market); // 검증 실패 시 저장하지 않았는지 확인한다.
    }

    @Test // contact 형식 위반 케이스를 테스트한다.
    @DisplayName("contact 형식이 잘못되면 INVALID_CONTACT_FORMAT을 반환한다") // 테스트 의도를 설명한다.
    void updateMarket_invalidContact_throwsInvalidContactFormat() { // contact 검증 예외를 확인한다.
        UpdateMarketRequest request = request(); // 요청 객체를 만든다.
        request.setContact("02-ABC-1234"); // 허용되지 않는 문자가 포함된 contact 를 지정한다.

        assertThatThrownBy(() -> marketService.updateMarket(user, request)) // 잘못된 요청을 실행한다.
                .isInstanceOf(InvalidContactFormatException.class); // INVALID_CONTACT_FORMAT 예외 타입을 검증한다.

        verify(marketRepository, never()).save(market); // 검증 실패 시 저장하지 않았는지 확인한다.
    }

    @Test // 요청자 소유 market 없음 케이스를 테스트한다.
    @DisplayName("요청자 소유 market이 없으면 MARKET_NOT_FOUND를 반환한다") // 테스트 의도를 설명한다.
    void updateMarket_marketNotFound_throwsMarketNotFound() { // market 없음 예외를 확인한다.
        when(marketRepository.findByUserId(user.getId())).thenReturn(Optional.empty()); // 요청자 소유 시장이 없도록 stubbing 한다.
        UpdateMarketRequest request = request(); // 요청 객체를 만든다.
        request.setName("새 시장"); // 빈 요청 검증을 지나도록 수정 필드를 지정한다.

        assertThatThrownBy(() -> marketService.updateMarket(user, request)) // 시장 없는 상태로 수정을 실행한다.
                .isInstanceOf(MarketPageMarketNotFoundException.class); // 404 MARKET_NOT_FOUND 재사용 예외 타입을 검증한다.
    }

    @Test // operatingHours null 유지 케이스를 테스트한다.
    @DisplayName("operatingHours가 null이면 기존 operatingHours를 유지한다") // 테스트 의도를 설명한다.
    void updateMarket_operatingHoursNull_keepsExistingValue() { // operatingHours null 유지 동작을 확인한다.
        UpdateMarketRequest request = request(); // 요청 객체를 만든다.
        request.setTargetCustomers("새 고객"); // 다른 필드만 수정하도록 지정한다.

        MarketService.Result result = marketService.updateMarket(user, request); // 시장 수정 서비스를 실행한다.

        assertThat(market.getOperatingHours()).isEqualTo("{\"weekday\":\"09:00~18:00\",\"weekend\":\"10:00~17:00\"}"); // 기존 operatingHours 유지 여부를 검증한다.
        assertThat(market.getTargetCustomers()).isEqualTo("새 고객"); // 함께 보낸 필드는 수정됐는지 검증한다.
        assertThat(result.getUpdatedFields()).containsExactly("targetCustomers"); // operatingHours 가 수정 목록에 없음을 검증한다.
        verify(marketRepository).save(market); // 변경 저장 호출을 검증한다.
    }

    @Test // weekend null 저장 케이스를 테스트한다.
    @DisplayName("operatingHours weekend가 null이면 null을 JSON으로 저장한다") // 테스트 의도를 설명한다.
    void updateMarket_operatingHoursWeekendNull_serializesWeekendNull() throws Exception { // weekend null 직렬화 동작을 확인한다.
        UpdateMarketOperatingHours operatingHours = new UpdateMarketOperatingHours(); // 운영시간 요청 객체를 만든다.
        operatingHours.setWeekday("09:00~22:00"); // weekday 값을 지정한다.
        operatingHours.setWeekend(null); // weekend null 로 일요일 미운영을 표현한다.
        UpdateMarketRequest request = request(); // 요청 객체를 만든다.
        request.setOperatingHours(operatingHours); // operatingHours 수정 값을 지정한다.

        MarketService.Result result = marketService.updateMarket(user, request); // 시장 수정 서비스를 실행한다.

        JsonNode root = objectMapper.readTree(market.getOperatingHours()); // 저장된 operatingHours JSON 을 파싱한다.
        assertThat(root.path("weekday").asText()).isEqualTo("09:00~22:00"); // weekday 값이 저장됐는지 검증한다.
        assertThat(root.has("weekend")).isTrue(); // weekend 키가 null 값으로 남아 있는지 검증한다.
        assertThat(root.path("weekend").isNull()).isTrue(); // weekend 값이 JSON null 인지 검증한다.
        assertThat(result.getUpdatedFields()).containsExactly("operatingHours"); // 수정 필드 목록을 검증한다.
        verify(marketRepository).save(market); // 변경 저장 호출을 검증한다.
    }

    private static UpdateMarketRequest request() { // 기본 요청 객체 생성 헬퍼다.
        return new UpdateMarketRequest(); // 모든 필드가 null 인 요청 객체를 반환한다.
    }
}

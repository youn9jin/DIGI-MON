package com.digimon.api.user; // 사용자 삭제 서비스 테스트 패키지를 선언한다.

import com.digimon.api.content.ContentRepository; // contents 삭제 mock 을 위해 가져온다.
import com.digimon.api.market.Market; // 테스트 market 엔티티를 만들기 위해 가져온다.
import com.digimon.api.market.MarketRepository; // markets repository mock 을 위해 가져온다.
import com.digimon.api.marketpage.MarketPageConfigRepository; // market_page_configs repository mock 을 위해 가져온다.
import com.digimon.api.marketpage.MarketPageRepository; // market_pages repository mock 을 위해 가져온다.
import com.digimon.api.store.StoreRepository; // stores repository mock 을 위해 가져온다.
import org.junit.jupiter.api.BeforeEach; // 각 테스트 전 fixture 생성을 위해 가져온다.
import org.junit.jupiter.api.DisplayName; // 테스트 표시명을 위해 가져온다.
import org.junit.jupiter.api.Test; // 테스트 메서드 표시를 위해 가져온다.
import org.junit.jupiter.api.extension.ExtendWith; // Mockito 확장을 적용하기 위해 가져온다.
import org.mockito.InOrder; // 삭제 순서 검증을 위해 가져온다.
import org.mockito.Mock; // mock 필드 선언을 위해 가져온다.
import org.mockito.junit.jupiter.MockitoExtension; // Mockito JUnit 5 확장을 가져온다.

import java.util.Optional; // repository Optional 응답을 만들기 위해 가져온다.

import static org.mockito.Mockito.inOrder; // InOrder 객체 생성을 위해 가져온다.
import static org.mockito.Mockito.never; // 미호출 검증을 위해 가져온다.
import static org.mockito.Mockito.verify; // mock 호출 검증을 위해 가져온다.
import static org.mockito.Mockito.when; // mock stubbing 을 위해 가져온다.

@ExtendWith(MockitoExtension.class) // Mockito mock 초기화를 JUnit 5 확장으로 처리한다.
class UserDeletionServiceTest { // UserDeletionService 단위 테스트 클래스다.

    @Mock // UserRepository 를 mock 으로 대체한다.
    UserRepository userRepository; // users 삭제 repository mock 이다.

    @Mock // MarketRepository 를 mock 으로 대체한다.
    MarketRepository marketRepository; // markets 조회와 삭제 repository mock 이다.

    @Mock // MarketPageConfigRepository 를 mock 으로 대체한다.
    MarketPageConfigRepository marketPageConfigRepository; // market_page_configs 삭제 repository mock 이다.

    @Mock // MarketPageRepository 를 mock 으로 대체한다.
    MarketPageRepository marketPageRepository; // market_pages 삭제 repository mock 이다.

    @Mock // ContentRepository 를 mock 으로 대체한다.
    ContentRepository contentRepository; // contents 삭제 repository mock 이다.

    @Mock // StoreRepository 를 mock 으로 대체한다.
    StoreRepository storeRepository; // stores 삭제 repository mock 이다.

    UserDeletionService userDeletionService; // 테스트 대상 서비스다.

    User user; // 테스트 탈퇴 사용자다.

    Market market; // 테스트 사용자의 시장이다.

    @BeforeEach // 각 테스트 전에 실행한다.
    void setUp() { // 공통 fixture 를 만든다.
        userDeletionService = new UserDeletionService( // 테스트 대상 서비스를 직접 생성한다.
                userRepository, // users repository mock 을 전달한다.
                marketRepository, // markets repository mock 을 전달한다.
                marketPageConfigRepository, // market_page_configs repository mock 을 전달한다.
                marketPageRepository, // market_pages repository mock 을 전달한다.
                contentRepository, // contents repository mock 을 전달한다.
                storeRepository); // stores repository mock 을 전달한다.

        user = new User(); // 테스트 사용자를 생성한다.
        user.setId(1L); // 사용자 ID 를 지정한다.
        user.setFirebaseUid("uid-1"); // Firebase UID 를 지정한다.

        market = new Market(); // 테스트 시장을 생성한다.
        market.setId(10L); // marketId 를 지정한다.
        market.setUser(user); // 시장 소유자를 테스트 사용자로 지정한다.
    }

    @Test // market 있는 정상 탈퇴 케이스를 테스트한다.
    @DisplayName("정상 탈퇴는 market이 있는 유저의 연관 데이터를 모두 삭제한다") // 테스트 의도를 설명한다.
    void deleteUserData_withMarket_deletesRelatedRows() { // market 있는 유저의 삭제 호출을 검증한다.
        when(marketRepository.findByUserId(user.getId())).thenReturn(Optional.of(market)); // 사용자 소유 market 이 있다고 설정한다.

        userDeletionService.deleteUserData(user); // DB hard delete 서비스를 실행한다.

        verify(marketPageConfigRepository).deleteByMarketId(10L); // market_page_configs 삭제 호출을 검증한다.
        verify(marketPageRepository).deleteByMarketId(10L); // market_pages 삭제 호출을 검증한다.
        verify(contentRepository).deleteByMarketId(10L); // contents 삭제 호출을 검증한다.
        verify(storeRepository).deleteByMarketId(10L); // stores 삭제 호출을 검증한다.
        verify(marketRepository).deleteByUserId(1L); // markets 삭제 호출을 검증한다.
        verify(userRepository).delete(user); // users 삭제 호출을 검증한다.
    }

    @Test // market 없는 정상 탈퇴 케이스를 테스트한다.
    @DisplayName("정상 탈퇴는 market이 없는 유저도 users만 삭제한다") // 테스트 의도를 설명한다.
    void deleteUserData_withoutMarket_deletesOnlyUser() { // market 없는 유저의 삭제 호출을 검증한다.
        when(marketRepository.findByUserId(user.getId())).thenReturn(Optional.empty()); // 사용자 소유 market 이 없다고 설정한다.

        userDeletionService.deleteUserData(user); // DB hard delete 서비스를 실행한다.

        verify(marketPageConfigRepository, never()).deleteByMarketId(10L); // market_page_configs 삭제가 호출되지 않았는지 검증한다.
        verify(marketPageRepository, never()).deleteByMarketId(10L); // market_pages 삭제가 호출되지 않았는지 검증한다.
        verify(contentRepository, never()).deleteByMarketId(10L); // contents 삭제가 호출되지 않았는지 검증한다.
        verify(storeRepository, never()).deleteByMarketId(10L); // stores 삭제가 호출되지 않았는지 검증한다.
        verify(marketRepository, never()).deleteByUserId(user.getId()); // markets 삭제가 호출되지 않았는지 검증한다.
        verify(userRepository).delete(user); // users row 는 삭제되는지 검증한다.
    }

    @Test // 삭제 순서 케이스를 테스트한다.
    @DisplayName("DB 삭제 순서는 FK 제약 순서를 따른다") // 테스트 의도를 설명한다.
    void deleteUserData_withMarket_deletesInRequiredOrder() { // repository 호출 순서를 검증한다.
        when(marketRepository.findByUserId(user.getId())).thenReturn(Optional.of(market)); // 사용자 소유 market 이 있다고 설정한다.

        userDeletionService.deleteUserData(user); // DB hard delete 서비스를 실행한다.

        InOrder inOrder = inOrder( // 여러 repository 사이 호출 순서를 추적한다.
                marketRepository, // market 조회와 삭제 순서를 포함한다.
                marketPageConfigRepository, // market_page_configs 삭제 순서를 포함한다.
                marketPageRepository, // market_pages 삭제 순서를 포함한다.
                contentRepository, // contents 삭제 순서를 포함한다.
                storeRepository, // stores 삭제 순서를 포함한다.
                userRepository); // users 삭제 순서를 포함한다.
        inOrder.verify(marketRepository).findByUserId(1L); // 먼저 사용자 소유 market 을 조회했는지 검증한다.
        inOrder.verify(marketPageConfigRepository).deleteByMarketId(10L); // market_page_configs 가 첫 번째로 삭제되는지 검증한다.
        inOrder.verify(marketPageRepository).deleteByMarketId(10L); // market_pages 가 두 번째로 삭제되는지 검증한다.
        inOrder.verify(contentRepository).deleteByMarketId(10L); // contents 가 stores 전에 삭제되는지 검증한다.
        inOrder.verify(storeRepository).deleteByMarketId(10L); // stores 가 markets 전에 삭제되는지 검증한다.
        inOrder.verify(marketRepository).deleteByUserId(1L); // markets 가 users 전에 삭제되는지 검증한다.
        inOrder.verify(userRepository).delete(user); // users 가 마지막에 삭제되는지 검증한다.
    }
}

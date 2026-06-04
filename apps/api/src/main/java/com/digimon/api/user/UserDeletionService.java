package com.digimon.api.user; // 사용자 도메인 패키지를 선언한다.

import com.digimon.api.content.ContentRepository; // contents 삭제 repository 를 가져온다.
import com.digimon.api.market.Market; // market 엔티티 타입을 가져온다.
import com.digimon.api.market.MarketRepository; // markets 삭제 repository 를 가져온다.
import com.digimon.api.marketpage.MarketPageConfigRepository; // market_page_configs 삭제 repository 를 가져온다.
import com.digimon.api.marketpage.MarketPageRepository; // market_pages 삭제 repository 를 가져온다.
import com.digimon.api.store.StoreRepository; // stores 삭제 repository 를 가져온다.
import org.springframework.stereotype.Service; // Spring Service 빈 등록을 위해 가져온다.
import org.springframework.transaction.annotation.Transactional; // 단일 트랜잭션 처리를 위해 가져온다.

import java.util.Optional; // market 존재 여부를 표현하기 위해 가져온다.

/**
 * 회원 탈퇴 시 DB hard delete 를 담당한다.
 */
@Service // Spring 서비스 계층 빈으로 등록한다.
public class UserDeletionService { // DELETE /api/me 의 DB 삭제 로직을 담당한다.

    private final UserRepository userRepository; // users 삭제 repository 다.

    private final MarketRepository marketRepository; // markets 조회와 삭제 repository 다.

    private final MarketPageConfigRepository marketPageConfigRepository; // market_page_configs 삭제 repository 다.

    private final MarketPageRepository marketPageRepository; // market_pages 삭제 repository 다.

    private final ContentRepository contentRepository; // contents 삭제 repository 다.

    private final StoreRepository storeRepository; // stores 삭제 repository 다.

    public UserDeletionService(UserRepository userRepository, // users repository 를 주입받는다.
                               MarketRepository marketRepository, // markets repository 를 주입받는다.
                               MarketPageConfigRepository marketPageConfigRepository, // market_page_configs repository 를 주입받는다.
                               MarketPageRepository marketPageRepository, // market_pages repository 를 주입받는다.
                               ContentRepository contentRepository, // contents repository 를 주입받는다.
                               StoreRepository storeRepository) { // stores repository 를 주입받는다.
        this.userRepository = userRepository; // users repository 를 필드에 저장한다.
        this.marketRepository = marketRepository; // markets repository 를 필드에 저장한다.
        this.marketPageConfigRepository = marketPageConfigRepository; // market_page_configs repository 를 필드에 저장한다.
        this.marketPageRepository = marketPageRepository; // market_pages repository 를 필드에 저장한다.
        this.contentRepository = contentRepository; // contents repository 를 필드에 저장한다.
        this.storeRepository = storeRepository; // stores repository 를 필드에 저장한다.
    }

    /**
     * 연관 데이터를 FK 제약 순서대로 삭제하고 마지막에 users row 를 삭제한다.
     */
    @Transactional // 모든 DB 삭제를 하나의 트랜잭션으로 묶는다.
    public void deleteUserData(User user) { // 탈퇴 대상 사용자의 모든 DB 데이터를 hard delete 한다.
        Optional<Market> marketOpt = marketRepository.findByUserId(user.getId()); // 사용자 소유 market 을 조회한다.
        if (marketOpt.isPresent()) { // market 이 있는 사용자인지 확인한다.
            Long marketId = marketOpt.get().getId(); // 연관 데이터 삭제에 사용할 marketId 를 꺼낸다.
            marketPageConfigRepository.deleteByMarketId(marketId); // market_page_configs 를 가장 먼저 삭제한다.
            marketPageRepository.deleteByMarketId(marketId); // market_pages 를 삭제한다.
            contentRepository.deleteByMarketId(marketId); // stores 와 markets 를 참조하는 contents 를 먼저 삭제한다.
            storeRepository.deleteByMarketId(marketId); // stores 를 삭제한다.
            marketRepository.deleteByUserId(user.getId()); // markets 를 삭제한다.
        }
        userRepository.delete(user); // 마지막으로 users row 를 삭제한다.
    }
}

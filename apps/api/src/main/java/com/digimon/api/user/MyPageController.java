package com.digimon.api.user;

import com.digimon.api.auth.FirebaseTokenService;
import com.digimon.api.auth.ForbiddenException;
import com.digimon.api.content.ContentRepository;
import com.digimon.api.market.Market;
import com.digimon.api.market.MarketRepository;
import com.digimon.api.marketpage.MarketPage;
import com.digimon.api.marketpage.MarketPageRepository;
import com.digimon.api.store.StoreRepository;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 마이페이지 묶음 조회.
 * ASSOCIATION 유저 대상이며 한 번의 호출로 마이페이지에 필요한 데이터를 모두 반환한다.
 *
 * 묶는 데이터(요약 화면 기준):
 * - profile      : User 본인 정보
 * - market       : 1:1 연결된 시장 정보 (없으면 null + missing 표시)
 * - marketPage   : 1:1 연결된 마켓 페이지 (발행 상태/템플릿)
 * - storeCount   : 등록된 가게 수 (상세 리스트는 별도 listing API 책임)
 * - contentCount : 등록된 콘텐츠 수
 * - missing      : onboarding 누락 항목 안내(role/market/marketPage)
 */
@RestController
@RequestMapping("/api")
public class MyPageController {

    private final FirebaseTokenService firebaseTokenService;
    private final UserService userService;
    private final MarketRepository marketRepository;
    private final MarketPageRepository marketPageRepository;
    private final StoreRepository storeRepository;
    private final ContentRepository contentRepository;

    public MyPageController(FirebaseTokenService firebaseTokenService,
                            UserService userService,
                            MarketRepository marketRepository,
                            MarketPageRepository marketPageRepository,
                            StoreRepository storeRepository,
                            ContentRepository contentRepository) {
        this.firebaseTokenService = firebaseTokenService;
        this.userService = userService;
        this.marketRepository = marketRepository;
        this.marketPageRepository = marketPageRepository;
        this.storeRepository = storeRepository;
        this.contentRepository = contentRepository;
    }

    @GetMapping("/mypage")
    public ResponseEntity<?> mypage(@RequestHeader(value = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message", "Missing or invalid Authorization header. Use: Bearer <ID_TOKEN>"
            ));
        }

        String idToken = authorization.substring("Bearer ".length()).trim();

        // try 범위는 토큰 검증으로만 한정. DB 오류/Forbidden/AuthAccountConflict 등은
        // 그대로 propagate 되어 GlobalExceptionHandler 가 403/409/500 으로 처리한다.
        FirebaseToken decoded;
        try {
            decoded = firebaseTokenService.verify(idToken);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message", "Invalid ID token",
                    "error", e.getMessage()
            ));
        }

        User user = userService.getOrCreateFromFirebase(decoded);

        if (user.getRole() != Role.ASSOCIATION) {
            throw new ForbiddenException("MyPage is available for ASSOCIATION users only");
        }

        return ResponseEntity.ok(buildMyPageResponse(user));
    }

    private Map<String, Object> buildMyPageResponse(User user) {
        Map<String, Object> res = new LinkedHashMap<>();
        List<String> missing = new ArrayList<>();

        res.put("profile", buildProfile(user));

        Optional<Market> marketOpt = marketRepository.findByUserId(user.getId());
        if (marketOpt.isEmpty()) {
            res.put("market", null);
            res.put("marketPage", null);
            res.put("storeCount", 0L);
            res.put("contentCount", 0L);
            missing.add("market");
        } else {
            Market market = marketOpt.get();
            res.put("market", buildMarket(market));

            Optional<MarketPage> pageOpt = marketPageRepository.findByMarketId(market.getId());
            if (pageOpt.isPresent()) {
                res.put("marketPage", buildMarketPage(pageOpt.get()));
            } else {
                res.put("marketPage", null);
                missing.add("marketPage");
            }

            res.put("storeCount", storeRepository.countByMarketId(market.getId()));
            res.put("contentCount", contentRepository.countByMarketId(market.getId()));
        }

        if (!missing.isEmpty()) {
            res.put("missing", missing);
        }
        return res;
    }

    private Map<String, Object> buildProfile(User user) {
        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("id", user.getId());
        profile.put("email", user.getEmail());
        profile.put("name", user.getName());
        profile.put("phone", user.getPhone());
        profile.put("role", user.getRole());
        return profile;
    }

    private Map<String, Object> buildMarket(Market market) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("marketId", market.getId());
        m.put("name", market.getName());
        m.put("address", market.getAddress());
        m.put("marketType", market.getMarketType());
        m.put("mainCategories", market.getMainCategories());
        m.put("totalStores", market.getTotalStores());
        m.put("operatingHours", market.getOperatingHours());
        m.put("targetCustomers", market.getTargetCustomers());
        m.put("contact", market.getContact());
        m.put("description", market.getDescription());
        return m;
    }

    private Map<String, Object> buildMarketPage(MarketPage page) {
        Map<String, Object> p = new LinkedHashMap<>();
        p.put("pageId", page.getId());
        p.put("templateType", page.getTemplateType());
        p.put("heroDescription", page.getHeroDescription());
        p.put("isPublished", page.getIsPublished());
        return p;
    }
}

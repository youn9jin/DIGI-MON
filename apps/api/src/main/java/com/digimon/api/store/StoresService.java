package com.digimon.api.store;

import com.digimon.api.market.Market;
import com.digimon.api.market.MarketRepository;
import com.digimon.api.store.dto.CreateStoresRequest;
import com.digimon.api.store.dto.StoreItemRequest;
import com.digimon.api.user.User;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * POST /api/stores 부분 성공 등록 서비스.
 *
 * 정책:
 * - 점포 수 한도(150) 초과 → TooManyStoresException (전체 차단, 400)
 * - market 미존재 → MarketNotFoundException (전체 차단, 409)
 * - 그 외 점포별 검증 실패 / DB 예외 → 해당 한 건만 failedItems 에 기록, 나머지는 정상 INSERT
 *
 * 트랜잭션:
 * - createStores 자체에는 트랜잭션을 두지 않는다.
 * - 점포 INSERT 는 self.saveOne(...) (REQUIRES_NEW) 으로 점포별 독립 트랜잭션을 가져
 *   한 건의 DB 예외(컬럼 길이 초과 등)가 다른 건을 롤백시키지 않도록 한다.
 */
@Service
public class StoresService {

    private static final int MAX_STORES_PER_MARKET = 150;

    /** category 화이트리스트. AssociationsService.ALLOWED_MAIN_CATEGORIES 와 동일하지만 모듈 분리 유지 위해 별도 정의. */
    private static final Set<String> ALLOWED_CATEGORIES =
            Set.of("농수산물", "먹거리", "의류", "생활용품", "기타");

    /** contact 정규식. OnboardingRequest.contact 와 동일 정책. */
    private static final Pattern CONTACT_PATTERN = Pattern.compile("^[0-9+\\-() ]{5,20}$");

    private final MarketRepository marketRepository;
    private final StoreRepository storeRepository;
    private final StoresService self;

    public StoresService(MarketRepository marketRepository,
                         StoreRepository storeRepository,
                         @Lazy StoresService self) {
        this.marketRepository = marketRepository;
        this.storeRepository = storeRepository;
        this.self = self;
    }

    public Result createStores(User user, CreateStoresRequest request) {
        Market market = marketRepository.findByUserId(user.getId())
                .orElseThrow(() -> new MarketNotFoundException("등록된 시장이 없습니다. 먼저 온보딩을 완료해주세요."));

        List<StoreItemRequest> items = request.getStores();
        long currentCount = storeRepository.countByMarketId(market.getId());
        if (currentCount + items.size() > MAX_STORES_PER_MARKET) {
            throw new TooManyStoresException(currentCount, items.size(), MAX_STORES_PER_MARKET);
        }

        List<Long> successStoreIds = new ArrayList<>();
        List<Map<String, Object>> failedItems = new ArrayList<>();

        for (int i = 0; i < items.size(); i++) {
            StoreItemRequest dto = items.get(i);

            String validationError = validate(dto);
            if (validationError != null) {
                failedItems.add(buildFailedItem(i, dto != null ? dto.getName() : null, validationError));
                continue;
            }

            try {
                Store saved = self.saveOne(market, dto);
                successStoreIds.add(saved.getId());
            } catch (Exception e) {
                // Bean 검증을 통과했지만 DB 제약 등으로 저장 실패한 경우. 해당 건만 실패 처리.
                failedItems.add(buildFailedItem(i, dto.getName(), "저장 중 오류가 발생했습니다."));
            }
        }

        return new Result(items.size(), successStoreIds, failedItems);
    }

    /**
     * 한 점포 INSERT 를 독립 트랜잭션으로 수행한다.
     * REQUIRES_NEW 로 분리되어 있어 이 메서드 내부 예외는 호출자(createStores) 트랜잭션에 영향을 주지 않는다.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Store saveOne(Market market, StoreItemRequest dto) {
        Store store = Store.builder()
                .market(market)
                .name(dto.getName().trim())
                .category(dto.getCategory())
                .items(trimToNull(dto.getItems()))
                .operatingHours(trimToNull(dto.getOperatingHours()))
                .yearsOfOperation(trimToNull(dto.getYearsOfOperation()))
                .contact(trimToNull(dto.getContact()))
                .description(trimToNull(dto.getDescription()))
                .build();
        return storeRepository.save(store);
    }

    /**
     * 점포 1건 검증. 첫 실패 사유를 한국어 메시지로 반환하며, 통과 시 null 을 반환한다.
     * 빈 문자열은 null 과 동일하게 취급(선택 필드는 미입력으로 간주).
     */
    private String validate(StoreItemRequest dto) {
        if (dto == null) {
            return "점포 정보가 비어있습니다.";
        }

        String name = trimToNull(dto.getName());
        if (name == null) {
            return "name은 필수 입력 항목입니다.";
        }
        if (name.length() > 100) {
            return "name은 1~100자여야 합니다.";
        }

        String category = dto.getCategory();
        if (category == null || category.isBlank()) {
            return "category는 필수 입력 항목입니다.";
        }
        if (!ALLOWED_CATEGORIES.contains(category)) {
            return "category는 농수산물/먹거리/의류/생활용품/기타 중 하나여야 합니다.";
        }

        String items = trimToNull(dto.getItems());
        if (items != null && items.length() > 255) {
            return "items는 1~255자여야 합니다.";
        }

        String operatingHours = trimToNull(dto.getOperatingHours());
        if (operatingHours != null && operatingHours.length() > 50) {
            return "operatingHours는 1~50자여야 합니다.";
        }

        String yearsOfOperation = trimToNull(dto.getYearsOfOperation());
        if (yearsOfOperation != null && yearsOfOperation.length() > 20) {
            return "yearsOfOperation은 1~20자여야 합니다.";
        }

        String contact = trimToNull(dto.getContact());
        if (contact != null && !CONTACT_PATTERN.matcher(contact).matches()) {
            return "contact는 숫자/+/-/()/공백으로 구성된 5~20자여야 합니다.";
        }

        String description = trimToNull(dto.getDescription());
        if (description != null && description.length() > 500) {
            return "description은 1~500자여야 합니다.";
        }

        return null;
    }

    private Map<String, Object> buildFailedItem(int index, String name, String reason) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("index", index);
        item.put("name", name);
        item.put("reason", reason);
        return item;
    }

    private static String trimToNull(String s) {
        if (s == null) {
            return null;
        }
        String trimmed = s.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    /** createStores 결과 컨테이너. 컨트롤러에서 응답 본문 빌드에 사용한다. */
    public static class Result {
        private final int totalCount;
        private final List<Long> successStoreIds;
        private final List<Map<String, Object>> failedItems;

        public Result(int totalCount,
                      List<Long> successStoreIds,
                      List<Map<String, Object>> failedItems) {
            this.totalCount = totalCount;
            this.successStoreIds = successStoreIds;
            this.failedItems = failedItems;
        }

        public int getTotalCount() {
            return totalCount;
        }

        public List<Long> getSuccessStoreIds() {
            return successStoreIds;
        }

        public List<Map<String, Object>> getFailedItems() {
            return failedItems;
        }

        public int getSuccessCount() {
            return successStoreIds.size();
        }

        public int getFailedCount() {
            return failedItems.size();
        }
    }
}

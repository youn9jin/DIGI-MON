package com.digimon.api.store;

import com.digimon.api.auth.ForbiddenException;
import com.digimon.api.content.ContentRepository;
import com.digimon.api.global.ValidationErrorDetail;
import com.digimon.api.global.ValidationErrorException;
import com.digimon.api.market.Market;
import com.digimon.api.market.MarketRepository;
import com.digimon.api.store.dto.CreateStoresRequest;
import com.digimon.api.store.dto.StoreItemRequest;
import com.digimon.api.store.dto.UpdateStoreRequest;
import com.digimon.api.user.User;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * 점포(Store) 도메인 서비스. POST 일괄 등록, GET 목록/상세, PATCH 부분 수정, DELETE 삭제를 담당한다.
 *
 * POST /api/stores 정책:
 * - 점포 수 한도(150) 초과 → TooManyStoresException (전체 차단, 400)
 * - market 미존재 → MarketNotFoundException (전체 차단, 409)
 * - 그 외 점포별 검증 실패 / DB 예외 → 해당 한 건만 failedItems 에 기록, 나머지는 정상 INSERT
 *
 * GET /api/stores/{storeId} & PATCH /api/stores/{storeId} & DELETE /api/stores/{storeId}:
 * - 점포 존재/소유권 검증은 requireOwnedStore() 헬퍼로 통일. 404 → 403 우선순위 유지.
 *
 * PATCH 정책:
 * - 모든 필드 optional. null 인 필드는 미변경.
 * - 검증은 누적하여 ValidationErrorException 으로 한 번에 반환(POST 의 "첫 실패만" 정책과 다름).
 * - name/category 가 trim 후 빈 → 검증 실패. 그 외 선택 필드는 trim 후 빈 → null 로 정규화하여 "값 지우기".
 *
 * DELETE 정책:
 * - Store 엔티티에 cascade 매핑이 없으므로 ContentRepository.deleteByStoreId 로 명시 cascade.
 * - contents 삭제 → store 삭제를 단일 @Transactional 안에서 처리하여 일관성 보장.
 *
 * 트랜잭션:
 * - createStores 자체에는 트랜잭션을 두지 않는다.
 * - 점포 INSERT 는 self.saveOne(...) (REQUIRES_NEW) 으로 점포별 독립 트랜잭션을 가져
 *   한 건의 DB 예외(컬럼 길이 초과 등)가 다른 건을 롤백시키지 않도록 한다.
 * - updateStore / deleteStore 는 단건이므로 일반 @Transactional(REQUIRED).
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
    private final ContentRepository contentRepository;
    private final StoresService self;

    public StoresService(MarketRepository marketRepository,
                         StoreRepository storeRepository,
                         ContentRepository contentRepository,
                         @Lazy StoresService self) {
        this.marketRepository = marketRepository;
        this.storeRepository = storeRepository;
        this.contentRepository = contentRepository;
        this.self = self;
    }

    public Result createStores(User user, CreateStoresRequest request) {
        Market market = marketRepository.findByUserId(user.getId())
                .orElseThrow(() -> new MarketNotFoundException("등록된 시장이 없습니다. 먼저 온보딩을 완료해주세요."));

        List<StoreItemRequest> items = request.getStores();
        // 재등록 시 기존 점포를 먼저 삭제하고 새 목록으로 교체한다
        storeRepository.deleteByMarketId(market.getId());

        // 삭제 후이므로 신규 등록 건수만 검사
        if (items.size() > MAX_STORES_PER_MARKET) {
            throw new TooManyStoresException(0L, items.size(), MAX_STORES_PER_MARKET);
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
     * GET /api/stores — 내 시장의 점포 목록.
     * market 이 없으면 빈 리스트를 반환한다(예외 X). 명세상 200 + total=0 + stores=[] 처리.
     */
    public List<Map<String, Object>> getStoreSummaries(User user) {
        Optional<Market> marketOpt = marketRepository.findByUserId(user.getId());
        if (marketOpt.isEmpty()) {
            return Collections.emptyList();
        }
        List<Store> stores = storeRepository.findByMarketId(marketOpt.get().getId());
        List<Map<String, Object>> result = new ArrayList<>(stores.size());
        for (Store store : stores) {
            result.add(toSummaryMap(store));
        }
        return result;
    }

    /**
     * GET /api/stores/{storeId} — 점포 상세.
     * - storeId 미존재 → StoreNotFoundException(404)
     * - 본인 market 소속이 아니면 → ForbiddenException(403)
     */
    public Map<String, Object> getStoreDetail(User user, Long storeId) {
        Store store = requireOwnedStore(user, storeId);
        return toDetailMap(store);
    }

    /**
     * PATCH /api/stores/{storeId} — 점포 부분 수정.
     * - 권한/존재 검증 → 누적 검증(400) → null 이 아닌 필드만 반영 → 저장 → 상세 응답 반환.
     * - @UpdateTimestamp 가 updatedAt 을 자동 갱신한다.
     */
    @Transactional
    public Map<String, Object> updateStore(User user, Long storeId, UpdateStoreRequest request) {
        Store store = requireOwnedStore(user, storeId);

        UpdateStoreRequest req = request != null ? request : new UpdateStoreRequest();

        List<ValidationErrorDetail> errors = validateForUpdate(req);
        if (!errors.isEmpty()) {
            throw new ValidationErrorException(errors);
        }

        if (req.getName() != null) {
            store.setName(req.getName().trim());
        }
        if (req.getCategory() != null) {
            store.setCategory(req.getCategory());
        }
        if (req.getItems() != null) {
            store.setItems(trimToNull(req.getItems()));
        }
        if (req.getOperatingHours() != null) {
            store.setOperatingHours(trimToNull(req.getOperatingHours()));
        }
        if (req.getYearsOfOperation() != null) {
            store.setYearsOfOperation(trimToNull(req.getYearsOfOperation()));
        }
        if (req.getContact() != null) {
            store.setContact(trimToNull(req.getContact()));
        }
        if (req.getDescription() != null) {
            store.setDescription(trimToNull(req.getDescription()));
        }
        // 이미지 배열: null이면 유지, 빈 배열이면 삭제, URL 배열이면 덮어쓰기
        if (req.getStoreImageUrls() != null) {
            store.setStoreImageUrls(req.getStoreImageUrls());
        }
        if (req.getMenuImageUrls() != null) {
            store.setMenuImageUrls(req.getMenuImageUrls());
        }
        if (req.getProductImageUrls() != null) {
            store.setProductImageUrls(req.getProductImageUrls());
        }

        Store saved = storeRepository.save(store);
        return toDetailMap(saved);
    }

    /**
     * DELETE /api/stores/{storeId} — 점포 삭제.
     * Store 엔티티에 cascade 매핑이 없으므로 contents 를 명시적으로 먼저 삭제한 뒤 store 를 삭제한다.
     * 두 작업은 단일 트랜잭션 안에서 진행되어 중간 실패 시 전체 롤백된다.
     */
    @Transactional
    public Map<String, Object> deleteStore(User user, Long storeId) {
        Store store = requireOwnedStore(user, storeId);
        contentRepository.deleteByStoreId(storeId);
        storeRepository.delete(store);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("storeId", storeId);
        body.put("message", "점포가 삭제되었습니다.");
        return body;
    }

    /**
     * 점포 단건 조회 + 본인 market 소속 검증.
     * 404 → 403 우선순위 유지(점포가 없으면 소유권 체크 전에 NOT_FOUND 반환).
     * 본인 market 이 아예 없는 유저도 동일하게 403 으로 떨어진다.
     */
    private Store requireOwnedStore(User user, Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new StoreNotFoundException("해당 점포를 찾을 수 없습니다."));

        Long ownerMarketId = marketRepository.findByUserId(user.getId())
                .map(Market::getId)
                .orElse(null);

        if (ownerMarketId == null || !ownerMarketId.equals(store.getMarket().getId())) {
            throw new ForbiddenException("해당 점포에 접근할 권한이 없습니다.");
        }
        return store;
    }

    /** 목록용. createdAt/updatedAt 미포함. 명세 키 순서 유지를 위해 LinkedHashMap 사용. */
    private Map<String, Object> toSummaryMap(Store store) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("storeId", store.getId());
        m.put("name", store.getName());
        m.put("category", store.getCategory());
        m.put("items", store.getItems());
        m.put("operatingHours", store.getOperatingHours());
        m.put("yearsOfOperation", store.getYearsOfOperation());
        m.put("contact", store.getContact());
        m.put("description", store.getDescription());
        m.put("storeImageUrls", store.getStoreImageUrls() != null ? store.getStoreImageUrls() : new ArrayList<>());
        m.put("menuImageUrls", store.getMenuImageUrls() != null ? store.getMenuImageUrls() : new ArrayList<>());
        m.put("productImageUrls", store.getProductImageUrls() != null ? store.getProductImageUrls() : new ArrayList<>());
        return m;
    }

    /** 상세용. summary 키에 createdAt/updatedAt 추가. */
    private Map<String, Object> toDetailMap(Store store) {
        Map<String, Object> m = toSummaryMap(store);
        m.put("createdAt", store.getCreatedAt());
        m.put("updatedAt", store.getUpdatedAt());
        return m;
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
                .storeImageUrls(dto.getStoreImageUrls() != null ? dto.getStoreImageUrls() : new ArrayList<>())
                .menuImageUrls(dto.getMenuImageUrls() != null ? dto.getMenuImageUrls() : new ArrayList<>())
                .productImageUrls(dto.getProductImageUrls() != null ? dto.getProductImageUrls() : new ArrayList<>())
                .build();
        return storeRepository.save(store);
    }

    /**
     * POST 점포 1건 검증. 첫 실패 사유를 한국어 메시지로 반환하며, 통과 시 null 을 반환한다.
     * name/category 는 필수, 그 외는 선택. 빈 문자열은 null 과 동일하게 취급(선택 필드는 미입력으로 간주).
     */
    private String validate(StoreItemRequest dto) {
        if (dto == null) {
            return "점포 정보가 비어있습니다.";
        }

        String err;
        if ((err = validateName(dto.getName(), true)) != null) return err;
        if ((err = validateCategory(dto.getCategory(), true)) != null) return err;
        if ((err = validateItems(dto.getItems())) != null) return err;
        if ((err = validateOperatingHours(dto.getOperatingHours())) != null) return err;
        if ((err = validateYearsOfOperation(dto.getYearsOfOperation())) != null) return err;
        if ((err = validateContact(dto.getContact())) != null) return err;
        if ((err = validateDescription(dto.getDescription())) != null) return err;
        if (dto.getStoreImageUrls() != null && dto.getStoreImageUrls().size() > 4) {
            return "storeImageUrls는 최대 4개까지 등록 가능합니다.";
        }
        if (dto.getMenuImageUrls() != null && dto.getMenuImageUrls().size() > 2) {
            return "menuImageUrls는 최대 2개까지 등록 가능합니다.";
        }
        if (dto.getProductImageUrls() != null && dto.getProductImageUrls().size() > 4) {
            return "productImageUrls는 최대 4개까지 등록 가능합니다.";
        }
        return null;
    }

    /**
     * PATCH 검증. null 인 필드는 미변경 의도로 간주하여 검증을 건너뛴다.
     * name/category 는 "값이 들어왔을 때만" 필수 규칙 적용(trim 후 빈이면 에러).
     * 모든 위반을 누적하여 반환한다(클라이언트가 한 번에 모든 에러를 받을 수 있도록).
     */
    private List<ValidationErrorDetail> validateForUpdate(UpdateStoreRequest dto) {
        List<ValidationErrorDetail> errors = new ArrayList<>();
        addIfPresent(errors, "name", dto.getName() != null ? validateName(dto.getName(), true) : null);
        addIfPresent(errors, "category", dto.getCategory() != null ? validateCategory(dto.getCategory(), true) : null);
        addIfPresent(errors, "items", validateItems(dto.getItems()));
        addIfPresent(errors, "operatingHours", validateOperatingHours(dto.getOperatingHours()));
        addIfPresent(errors, "yearsOfOperation", validateYearsOfOperation(dto.getYearsOfOperation()));
        addIfPresent(errors, "contact", validateContact(dto.getContact()));
        addIfPresent(errors, "description", validateDescription(dto.getDescription()));
        if (dto.getStoreImageUrls() != null && dto.getStoreImageUrls().size() > 4) {
            errors.add(new ValidationErrorDetail("storeImageUrls",
                    "storeImageUrls는 최대 4개까지 등록 가능합니다."));
        }
        if (dto.getMenuImageUrls() != null && dto.getMenuImageUrls().size() > 2) {
            errors.add(new ValidationErrorDetail("menuImageUrls",
                    "menuImageUrls는 최대 2개까지 등록 가능합니다."));
        }
        if (dto.getProductImageUrls() != null && dto.getProductImageUrls().size() > 4) {
            errors.add(new ValidationErrorDetail("productImageUrls",
                    "productImageUrls는 최대 4개까지 등록 가능합니다."));
        }
        return errors;
    }

    private static void addIfPresent(List<ValidationErrorDetail> errors, String field, String reason) {
        if (reason != null) {
            errors.add(new ValidationErrorDetail(field, reason));
        }
    }

    // --- 필드별 검증 (POST/PATCH 공유) ---
    // 각 메서드는 위반 시 한국어 메시지를 반환하고, 통과 시 null 을 반환한다.

    private static String validateName(String name, boolean required) {
        String trimmed = trimToNull(name);
        if (trimmed == null) {
            return required ? "name은 필수 입력 항목입니다." : null;
        }
        if (trimmed.length() > 100) {
            return "name은 1~100자여야 합니다.";
        }
        return null;
    }

    private static String validateCategory(String category, boolean required) {
        if (category == null || category.isBlank()) {
            return required ? "category는 필수 입력 항목입니다." : null;
        }
        if (!ALLOWED_CATEGORIES.contains(category)) {
            return "category는 농수산물/먹거리/의류/생활용품/기타 중 하나여야 합니다.";
        }
        return null;
    }

    private static String validateItems(String value) {
        String trimmed = trimToNull(value);
        if (trimmed != null && trimmed.length() > 255) {
            return "items는 1~255자여야 합니다.";
        }
        return null;
    }

    private static String validateOperatingHours(String value) {
        String trimmed = trimToNull(value);
        if (trimmed != null && trimmed.length() > 50) {
            return "operatingHours는 1~50자여야 합니다.";
        }
        return null;
    }

    private static String validateYearsOfOperation(String value) {
        String trimmed = trimToNull(value);
        if (trimmed != null && trimmed.length() > 20) {
            return "yearsOfOperation은 1~20자여야 합니다.";
        }
        return null;
    }

    private static String validateContact(String value) {
        String trimmed = trimToNull(value);
        if (trimmed != null && !CONTACT_PATTERN.matcher(trimmed).matches()) {
            return "contact는 숫자/+/-/()/공백으로 구성된 5~20자여야 합니다.";
        }
        return null;
    }

    private static String validateDescription(String value) {
        String trimmed = trimToNull(value);
        if (trimmed != null && trimmed.length() > 500) {
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

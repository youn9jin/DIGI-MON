package com.digimon.api.market; // 시장 도메인 패키지를 선언한다.

import com.digimon.api.market.dto.UpdateMarketRequest; // 시장 수정 요청 DTO 를 가져온다.
import com.digimon.api.marketpage.MarketPageMarketNotFoundException; // 404 MARKET_NOT_FOUND 재사용 예외를 가져온다.
import com.digimon.api.marketpage.NoFieldsToUpdateException; // 400 NO_FIELDS_TO_UPDATE 재사용 예외를 가져온다.
import com.digimon.api.user.User; // 인증된 사용자 엔티티를 가져온다.
import com.fasterxml.jackson.core.JsonProcessingException; // 운영 시간 JSON 직렬화 실패 타입을 가져온다.
import com.fasterxml.jackson.databind.ObjectMapper; // 운영 시간 객체를 JSON 문자열로 바꾸기 위해 가져온다.
import org.springframework.stereotype.Service; // Spring Service 빈 등록을 위해 가져온다.
import org.springframework.transaction.annotation.Transactional; // 트랜잭션 경계를 선언하기 위해 가져온다.

import java.util.ArrayList; // 수정된 필드명을 순서대로 담기 위해 가져온다.
import java.util.List; // 응답 필드 목록 타입으로 사용한다.
import java.util.Set; // 허용값 집합 타입으로 사용한다.
import java.util.regex.Pattern; // contact 형식 검증 정규식을 위해 가져온다.

@Service // Spring 서비스 계층 빈으로 등록한다.
public class MarketService { // PATCH /api/market 도메인 로직을 담당한다.

    private static final Set<String> ALLOWED_MARKET_TYPES = Set.of("전통시장", "상점가", "복합시장"); // marketType 허용값을 정의한다.

    private static final Set<String> ALLOWED_TOTAL_STORES = Set.of( // totalStores 허용값을 정의한다.
            "10개 이상 20개 미만", // 10개 이상 20개 미만 구간을 허용한다.
            "20개 이상 30개 미만", // 20개 이상 30개 미만 구간을 허용한다.
            "30개 이상 40개 미만", // 30개 이상 40개 미만 구간을 허용한다.
            "40개 이상 50개 미만", // 40개 이상 50개 미만 구간을 허용한다.
            "50개 이상" // 50개 이상 구간을 허용한다.
    );

    private static final Pattern CONTACT_PATTERN = Pattern.compile("^[0-9+\\-()\\s]{5,20}$"); // 연락처 허용 문자와 길이를 검증한다.

    private final MarketRepository marketRepository; // Market 조회와 저장을 담당하는 repository 다.

    private final ObjectMapper objectMapper; // operatingHours 직렬화를 담당하는 mapper 다.

    public MarketService(MarketRepository marketRepository, ObjectMapper objectMapper) { // 의존성을 주입받는 생성자다.
        this.marketRepository = marketRepository; // repository 의존성을 보관한다.
        this.objectMapper = objectMapper; // ObjectMapper 의존성을 보관한다.
    }

    /**
     * null 이 아닌 필드만 선택적으로 수정하고 수정된 필드명을 반환한다.
     */
    @Transactional // Market 변경을 하나의 트랜잭션으로 처리한다.
    public Result updateMarket(User user, UpdateMarketRequest request) { // 인증 사용자와 요청 본문으로 시장 정보를 수정한다.
        Market market = marketRepository.findByUserId(user.getId()) // 요청자 소유 시장을 Optional 로 조회한다.
                .orElseThrow(() -> new MarketPageMarketNotFoundException("등록된 시장이 없습니다.")); // 없으면 404 MARKET_NOT_FOUND 를 반환한다.

        if (request == null || hasNoFieldsToUpdate(request)) { // 요청 본문이 없거나 모든 필드가 null 인지 확인한다.
            throw new NoFieldsToUpdateException("수정할 필드가 없습니다."); // 400 NO_FIELDS_TO_UPDATE 를 반환한다.
        }

        validateRequest(request); // 선택적으로 전달된 값들의 명세 허용 여부를 검증한다.

        List<String> updatedFields = new ArrayList<>(); // 응답에 담을 수정 필드명을 요청 순서대로 누적한다.

        if (request.getName() != null) { // name 이 전달되었는지 확인한다.
            market.setName(request.getName()); // name 컬럼 값을 새 값으로 변경한다.
            updatedFields.add("name"); // name 이 수정되었음을 응답 목록에 추가한다.
        }
        if (request.getAddress() != null) { // address 가 전달되었는지 확인한다.
            market.setAddress(request.getAddress()); // address 컬럼 값을 새 값으로 변경한다.
            updatedFields.add("address"); // address 가 수정되었음을 응답 목록에 추가한다.
        }
        if (request.getMarketType() != null) { // marketType 이 전달되었는지 확인한다.
            market.setMarketType(request.getMarketType()); // market_type 컬럼 값을 새 값으로 변경한다.
            updatedFields.add("marketType"); // marketType 이 수정되었음을 응답 목록에 추가한다.
        }
        if (request.getTotalStores() != null) { // totalStores 가 전달되었는지 확인한다.
            market.setTotalStores(request.getTotalStores()); // total_stores 컬럼 값을 새 값으로 변경한다.
            updatedFields.add("totalStores"); // totalStores 가 수정되었음을 응답 목록에 추가한다.
        }
        if (request.getOperatingHours() != null) { // operatingHours 객체가 전달되었는지 확인한다.
            market.setOperatingHours(serializeOperatingHours(request)); // operating_hours 컬럼에 JSON 문자열을 저장한다.
            updatedFields.add("operatingHours"); // operatingHours 가 수정되었음을 응답 목록에 추가한다.
        }
        if (request.getTargetCustomers() != null) { // targetCustomers 가 전달되었는지 확인한다.
            market.setTargetCustomers(request.getTargetCustomers()); // target_customers 컬럼 값을 새 값으로 변경한다.
            updatedFields.add("targetCustomers"); // targetCustomers 가 수정되었음을 응답 목록에 추가한다.
        }
        if (request.getContact() != null) { // contact 가 전달되었는지 확인한다.
            market.setContact(request.getContact()); // contact 컬럼 값을 새 값으로 변경한다.
            updatedFields.add("contact"); // contact 가 수정되었음을 응답 목록에 추가한다.
        }

        marketRepository.save(market); // 변경된 Market 을 명시적으로 저장한다.
        return new Result(market.getId(), updatedFields); // marketId 와 수정 필드 목록을 반환한다.
    }

    private static boolean hasNoFieldsToUpdate(UpdateMarketRequest request) { // 모든 수정 가능 필드가 null 인지 확인한다.
        return request.getName() == null // name 이 null 인지 확인한다.
                && request.getAddress() == null // address 가 null 인지 확인한다.
                && request.getMarketType() == null // marketType 이 null 인지 확인한다.
                && request.getTotalStores() == null // totalStores 가 null 인지 확인한다.
                && request.getOperatingHours() == null // operatingHours 가 null 인지 확인한다.
                && request.getTargetCustomers() == null // targetCustomers 가 null 인지 확인한다.
                && request.getContact() == null; // contact 가 null 인지 확인한다.
    }

    private static void validateRequest(UpdateMarketRequest request) { // 선택적으로 전달된 검증 대상 값을 검사한다.
        if (request.getMarketType() != null && !ALLOWED_MARKET_TYPES.contains(request.getMarketType())) { // marketType 허용값 위반 여부를 확인한다.
            throw new InvalidMarketTypeException("marketType 은 전통시장, 상점가, 복합시장 중 하나여야 합니다."); // INVALID_MARKET_TYPE 을 반환한다.
        }
        if (request.getTotalStores() != null && !ALLOWED_TOTAL_STORES.contains(request.getTotalStores())) { // totalStores 허용값 위반 여부를 확인한다.
            throw new InvalidTotalStoresException("totalStores 값이 허용되지 않습니다."); // INVALID_TOTAL_STORES 를 반환한다.
        }
        if (request.getContact() != null && !CONTACT_PATTERN.matcher(request.getContact()).matches()) { // contact 형식 위반 여부를 확인한다.
            throw new InvalidContactFormatException("contact 는 숫자, +, -, 괄호, 공백으로 구성된 5~20자여야 합니다."); // INVALID_CONTACT_FORMAT 을 반환한다.
        }
    }

    private String serializeOperatingHours(UpdateMarketRequest request) { // operatingHours 객체를 JSON 문자열로 변환한다.
        try { // Jackson 직렬화 예외를 처리하기 위해 try 블록을 시작한다.
            return objectMapper.writeValueAsString(request.getOperatingHours()); // weekday/weekend 값을 JSON 문자열로 직렬화한다.
        } catch (JsonProcessingException e) { // JSON 직렬화 실패를 잡는다.
            throw new IllegalStateException("Failed to serialize operatingHours", e); // 정상 DTO 직렬화 실패는 서버 오류로 전달한다.
        }
    }

    /** 컨트롤러 응답 구성에 사용하는 수정 결과 컨테이너다. */
    public static class Result { // 수정 결과를 담는 단순 컨테이너다.

        private final Long marketId; // 수정된 시장 ID 를 보관한다.

        private final List<String> updatedFields; // 수정된 필드명 목록을 보관한다.

        public Result(Long marketId, List<String> updatedFields) { // 결과 객체 생성자다.
            this.marketId = marketId; // marketId 값을 보관한다.
            this.updatedFields = updatedFields; // updatedFields 값을 보관한다.
        }

        public Long getMarketId() { // marketId getter 다.
            return marketId; // marketId 값을 반환한다.
        }

        public List<String> getUpdatedFields() { // updatedFields getter 다.
            return updatedFields; // updatedFields 값을 반환한다.
        }
    }
}

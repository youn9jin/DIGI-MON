package com.digimon.api.associations;

import com.digimon.api.associations.dto.OnboardingRequest;
import com.digimon.api.global.ValidationErrorDetail;
import com.digimon.api.global.ValidationErrorException;
import com.digimon.api.market.Market;
import com.digimon.api.market.MarketRepository;
import com.digimon.api.user.User;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class AssociationsService {

    /** mainCategories 허용값. Bean Validation 만으로 표현하기 어려워 서비스단에서 직접 검증. */
    private static final Set<String> ALLOWED_MAIN_CATEGORIES =
            Set.of("농수산물", "먹거리", "의류", "생활용품", "기타");

    private final MarketRepository marketRepository;
    private final ObjectMapper objectMapper;

    public AssociationsService(MarketRepository marketRepository, ObjectMapper objectMapper) {
        this.marketRepository = marketRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * 온보딩 요청을 받아 Market 레코드를 생성한다.
     * - mainCategories 화이트리스트 위반 → 400 VALIDATION_ERROR
     * - operatingHours 는 JSON 문자열로 직렬화하여 markets.operating_hours(varchar) 단일 컬럼에 저장
     * - user_id unique 제약으로 중복 온보딩은 DataIntegrityViolationException 발생 (컨트롤러에서 existsByUserId 로 선차단)
     */
    @Transactional
    public Market createMarket(User user, OnboardingRequest request) {
        validateMainCategories(request.getMainCategories());

        String operatingHoursJson = serializeOperatingHours(request);

        Market market = Market.builder()
                .user(user)
                .name(request.getName().trim())
                .address(request.getAddress().trim())
                .marketType(request.getMarketType())
                .mainCategories(request.getMainCategories())
                .totalStores(request.getTotalStores())
                .operatingHours(operatingHoursJson)
                .targetCustomers(request.getTargetCustomers().trim())
                .contact(trimToNull(request.getContact()))
                .description(trimToNull(request.getDescription()))
                .managerName(trimToNull(request.getManagerName()))
                .managerTitle(trimToNull(request.getManagerTitle()))
                .build();

        return marketRepository.save(market);
    }

    private void validateMainCategories(String[] categories) {
        List<ValidationErrorDetail> details = new ArrayList<>();
        for (int i = 0; i < categories.length; i++) {
            String value = categories[i];
            if (value == null || !ALLOWED_MAIN_CATEGORIES.contains(value)) {
                details.add(new ValidationErrorDetail(
                        "mainCategories[" + i + "]",
                        "must be one of 농수산물/먹거리/의류/생활용품/기타"));
            }
        }
        if (!details.isEmpty()) {
            throw new ValidationErrorException(details);
        }
    }

    private String serializeOperatingHours(OnboardingRequest request) {
        try {
            return objectMapper.writeValueAsString(request.getOperatingHours());
        } catch (JsonProcessingException e) {
            // 표준 JavaBean DTO 직렬화이므로 사실상 도달 불가. 도달 시 500 으로 GlobalExceptionHandler 처리.
            throw new IllegalStateException("Failed to serialize operatingHours", e);
        }
    }

    private static String trimToNull(String s) {
        if (s == null) {
            return null;
        }
        String trimmed = s.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}

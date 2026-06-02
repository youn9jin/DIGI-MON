package com.digimon.api.marketpage;

import com.digimon.api.market.Market;
import com.digimon.api.market.MarketRepository;
import com.digimon.api.marketpage.dto.UpdateMarketPageTextRequest;
import com.digimon.api.user.User;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * PATCH /api/market/page/text 도메인 서비스.
 *
 * content_json 은 JsonNode 기반 surgery 로 필요한 키만 바꾼다. DTO 로 다시 직렬화하지 않으므로
 * store_highlights, cta 와 향후 추가될 미지의 키도 그대로 보존된다.
 */
@Service
public class MarketPageTextService {

    /** hero.subtitle 최대 글자 수. */
    private static final int HERO_SUBTITLE_MAX_LENGTH = 50;

    /** intro.content 와 features description 최대 글자 수. */
    private static final int CONTENT_MAX_LENGTH = 300;

    /** market_page_configs.history_text 최대 글자 수. */
    private static final int HISTORY_TEXT_MAX_LENGTH = 200;

    /** market_page_configs.directions_text 최대 글자 수. */
    private static final int DIRECTIONS_TEXT_MAX_LENGTH = 500;

    private final MarketRepository marketRepository;
    private final MarketPageRepository marketPageRepository;
    private final MarketPageConfigRepository marketPageConfigRepository;
    private final ObjectMapper objectMapper;

    public MarketPageTextService(MarketRepository marketRepository,
                                 MarketPageRepository marketPageRepository,
                                 MarketPageConfigRepository marketPageConfigRepository,
                                 ObjectMapper objectMapper) {
        this.marketRepository = marketRepository;
        this.marketPageRepository = marketPageRepository;
        this.marketPageConfigRepository = marketPageConfigRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * null 이 아닌 텍스트 필드만 수정하고 실제 수정된 필드명을 요청 순서대로 반환한다.
     */
    @Transactional
    public Result updateText(User user, UpdateMarketPageTextRequest request) {
        // 요청자 소유 시장이 없으면 명세에 따라 404 MARKET_NOT_FOUND 를 반환한다.
        Market market = marketRepository.findByUserId(user.getId())
                .orElseThrow(() -> new MarketPageMarketNotFoundException(
                        "등록된 시장이 없습니다. 먼저 온보딩을 완료해주세요."));

        // market_id 는 unique 이므로 PENDING 이면 DONE 조회보다 먼저 중단해야 명세 오류를 반환할 수 있다.
        marketPageRepository.findByMarketIdAndStatus(market.getId(), MarketPageStatus.PENDING)
                .ifPresent(page -> {
                    throw new AlreadyInProgressException("이미 생성 중인 페이지가 있습니다.");
                });

        // 텍스트 수정은 AI 생성이 완료된 페이지에만 허용한다.
        MarketPage page = marketPageRepository.findByMarketIdAndStatus(market.getId(), MarketPageStatus.DONE)
                .orElseThrow(() -> new PageNotFoundException("생성 완료된 페이지를 찾을 수 없습니다."));

        // JSON null 본문도 모든 필드가 null 인 요청과 동일하게 처리한다.
        if (request == null || hasNoFieldsToUpdate(request)) {
            throw new NoFieldsToUpdateException("수정할 필드가 없습니다.");
        }

        // JSON 파싱이나 저장 전에 모든 길이 제한을 검증한다.
        validateLengths(request);

        // 응답은 실제로 null 이 아니어서 수정한 필드명만 요청 필드 순서대로 담는다.
        List<String> updatedFields = new ArrayList<>();

        // content_json 대상 필드가 하나라도 있을 때만 JSON 을 파싱하고 다시 저장한다.
        if (hasContentJsonFields(request)) {
            ObjectNode root = parseContentJson(page);
            updateContentJson(root, request, updatedFields);
            page.setContentJson(writeContentJson(root));
            marketPageRepository.save(page);
        }

        // config 대상 필드가 하나라도 있을 때만 기존 row 를 수정하거나 방어적으로 신규 INSERT 한다.
        if (hasConfigFields(request)) {
            MarketPageConfig config = findOrCreateConfig(market, page);
            updateConfig(config, request, updatedFields);
            marketPageConfigRepository.save(config);
        }

        return new Result(market.getId(), updatedFields);
    }

    /** 요청에 null 이 아닌 필드가 하나라도 있는지 확인한다. */
    private static boolean hasNoFieldsToUpdate(UpdateMarketPageTextRequest request) {
        return request.getHeroSubtitle() == null
                && request.getIntroContent() == null
                && request.getFeature1Description() == null
                && request.getFeature2Description() == null
                && request.getHistoryText() == null
                && request.getDirectionsText() == null;
    }

    /** content_json 변경이 필요한지 확인한다. */
    private static boolean hasContentJsonFields(UpdateMarketPageTextRequest request) {
        return request.getHeroSubtitle() != null
                || request.getIntroContent() != null
                || request.getFeature1Description() != null
                || request.getFeature2Description() != null;
    }

    /** market_page_configs 변경이 필요한지 확인한다. */
    private static boolean hasConfigFields(UpdateMarketPageTextRequest request) {
        return request.getHistoryText() != null || request.getDirectionsText() != null;
    }

    /** 각 필드의 명세상 최대 글자 수를 검증한다. */
    private static void validateLengths(UpdateMarketPageTextRequest request) {
        validateLength("heroSubtitle", request.getHeroSubtitle(), HERO_SUBTITLE_MAX_LENGTH);
        validateLength("introContent", request.getIntroContent(), CONTENT_MAX_LENGTH);
        validateLength("feature1Description", request.getFeature1Description(), CONTENT_MAX_LENGTH);
        validateLength("feature2Description", request.getFeature2Description(), CONTENT_MAX_LENGTH);
        validateLength("historyText", request.getHistoryText(), HISTORY_TEXT_MAX_LENGTH);
        validateLength("directionsText", request.getDirectionsText(), DIRECTIONS_TEXT_MAX_LENGTH);
    }

    /** 단일 필드 제한 초과 시 초과 필드명을 포함한 예외를 던진다. */
    private static void validateLength(String fieldName, String value, int maxLength) {
        if (value != null && value.length() > maxLength) {
            throw new FieldTooLongException(fieldName + " 필드는 " + maxLength + "자 이하여야 합니다.");
        }
    }

    /** content_json 을 객체 노드로 파싱한다. */
    private ObjectNode parseContentJson(MarketPage page) {
        String contentJson = page.getContentJson();
        if (contentJson == null || contentJson.isBlank()) {
            throw new ContentParseErrorException("content_json 이 비어 있어 수정할 수 없습니다.");
        }

        try {
            JsonNode root = objectMapper.readTree(contentJson);
            if (!(root instanceof ObjectNode objectNode)) {
                throw new ContentParseErrorException("content_json 최상위 값이 객체가 아닙니다.");
            }
            return objectNode;
        } catch (ContentParseErrorException e) {
            throw e;
        } catch (Exception e) {
            throw new ContentParseErrorException("content_json 파싱에 실패했습니다.", e);
        }
    }

    /** content_json 안에서 요청된 키만 선택적으로 변경한다. */
    private static void updateContentJson(ObjectNode root,
                                          UpdateMarketPageTextRequest request,
                                          List<String> updatedFields) {
        if (request.getHeroSubtitle() != null) {
            requireObject(root, "hero").put("subtitle", request.getHeroSubtitle());
            updatedFields.add("heroSubtitle");
        }
        if (request.getIntroContent() != null) {
            requireObject(root, "intro").put("content", request.getIntroContent());
            updatedFields.add("introContent");
        }
        if (request.getFeature1Description() != null) {
            requireFeature(root, 0).put("description", request.getFeature1Description());
            updatedFields.add("feature1Description");
        }
        if (request.getFeature2Description() != null) {
            requireFeature(root, 1).put("description", request.getFeature2Description());
            updatedFields.add("feature2Description");
        }
    }

    /** 필수 JSON 객체가 없거나 객체가 아니면 CONTENT_PARSE_ERROR 를 반환한다. */
    private static ObjectNode requireObject(ObjectNode parent, String fieldName) {
        JsonNode node = parent.get(fieldName);
        if (!(node instanceof ObjectNode objectNode)) {
            throw new ContentParseErrorException("content_json." + fieldName + " 객체가 없습니다.");
        }
        return objectNode;
    }

    /** features 배열 길이와 원소 타입을 검증한 뒤 요청된 원소를 반환한다. */
    private static ObjectNode requireFeature(ObjectNode root, int index) {
        JsonNode node = root.get("features");
        if (!(node instanceof ArrayNode features) || features.size() <= index) {
            throw new ContentParseErrorException("content_json.features[" + index + "] 항목이 없습니다.");
        }
        JsonNode feature = features.get(index);
        if (!(feature instanceof ObjectNode featureObject)) {
            throw new ContentParseErrorException("content_json.features[" + index + "] 항목이 객체가 아닙니다.");
        }
        return featureObject;
    }

    /** 변경된 JSON 객체를 문자열로 직렬화한다. */
    private String writeContentJson(ObjectNode root) {
        try {
            return objectMapper.writeValueAsString(root);
        } catch (Exception e) {
            throw new ContentParseErrorException("content_json 직렬화에 실패했습니다.", e);
        }
    }

    /** 정상 플로우에는 존재하는 config row 가 없으면 NOT NULL 컬럼 기본값을 채워 방어적으로 생성한다. */
    private MarketPageConfig findOrCreateConfig(Market market, MarketPage page) {
        Optional<MarketPageConfig> existing = marketPageConfigRepository.findByMarketId(market.getId());
        if (existing.isPresent()) {
            return existing.get();
        }
        return MarketPageConfig.builder()
                .market(market)
                .templateType(page.getTemplateType())
                .selectedSections(new ArrayList<>())
                .build();
    }

    /** config row 의 요청된 텍스트 컬럼만 변경한다. */
    private static void updateConfig(MarketPageConfig config,
                                     UpdateMarketPageTextRequest request,
                                     List<String> updatedFields) {
        if (request.getHistoryText() != null) {
            config.setHistoryText(request.getHistoryText());
            updatedFields.add("historyText");
        }
        if (request.getDirectionsText() != null) {
            config.setDirectionsText(request.getDirectionsText());
            updatedFields.add("directionsText");
        }
    }

    /** 컨트롤러 응답 구성에 사용하는 수정 결과 컨테이너. */
    public static class Result {

        private final Long marketId;
        private final List<String> updatedFields;

        public Result(Long marketId, List<String> updatedFields) {
            this.marketId = marketId;
            this.updatedFields = updatedFields;
        }

        public Long getMarketId() {
            return marketId;
        }

        public List<String> getUpdatedFields() {
            return updatedFields;
        }
    }
}

package com.digimon.api.market;

import com.digimon.api.global.ResponseWrapper;
import com.digimon.api.marketpage.PublicMarketPageService;
import com.digimon.api.marketpage.dto.PublicMarketPageResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 공개 시장 페이지 API. 인증 없이 접근 가능(ANONYMOUS).
 *
 * 엔드포인트:
 * - GET /api/market/{marketId} : DONE 상태 시장 페이지 콘텐츠 + 설정 메타데이터 반환.
 */
@RestController
@RequestMapping("/api")
public class PublicMarketController {

    private final PublicMarketPageService publicMarketPageService;

    public PublicMarketController(PublicMarketPageService publicMarketPageService) {
        this.publicMarketPageService = publicMarketPageService;
    }

    @GetMapping("/market/{marketId}")
    public ResponseEntity<ResponseWrapper<PublicMarketPageResponse>> getPublicMarketPage(
            @PathVariable Long marketId) {
        PublicMarketPageResponse data = publicMarketPageService.getPublicMarketPage(marketId);
        return ResponseEntity.ok(ResponseWrapper.success(data));
    }
}

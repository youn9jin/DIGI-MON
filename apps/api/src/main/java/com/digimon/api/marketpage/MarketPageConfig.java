package com.digimon.api.marketpage;

import com.digimon.api.market.Market;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 시장 페이지 생성 설정(market_page_configs). POST /api/market/page/setup 에서 market_id 기준 UPSERT 한다.
 *
 * DB 스키마 주의:
 * - market_id 는 UNIQUE (시장당 설정 1개) → findByMarketId 후 save() 로 UPSERT.
 * - selected_sections 는 jsonb NOT NULL. Hibernate 6 네이티브 @JdbcTypeCode(SqlTypes.JSON) 로 매핑.
 * - created_at 컬럼은 존재하지 않는다 (updated_at 만 존재). ddl-auto=validate 이므로 created_at 매핑 금지.
 * - 콘텐츠 텍스트 컬럼은 intro/history/directions 3개뿐. stores/tourism 섹션은 selected_sections 토글로만 존재.
 */
@Entity
@Table(name = "market_page_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketPageConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "config_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "market_id", nullable = false, unique = true)
    private Market market;

    @Column(name = "template_type", length = 20, nullable = false)
    private String templateType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "selected_sections", columnDefinition = "jsonb", nullable = false)
    private List<String> selectedSections;

    @Column(name = "intro_text", columnDefinition = "TEXT")
    private String introText;

    @Column(name = "history_text", columnDefinition = "TEXT")
    private String historyText;

    @Column(name = "directions_text", columnDefinition = "TEXT")
    private String directionsText;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}

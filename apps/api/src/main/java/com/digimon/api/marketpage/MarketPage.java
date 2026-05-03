package com.digimon.api.marketpage;

import com.digimon.api.market.Market;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "market_pages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketPage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "page_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "market_id", nullable = false, unique = true)
    private Market market;

    @Column(name = "template_type", length = 10)
    @Builder.Default
    private String templateType = "A";

    @Column(name = "hero_description", columnDefinition = "TEXT")
    private String heroDescription;

    @Column(name = "is_published", nullable = false)
    @Builder.Default
    private Boolean isPublished = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./ClassicMarketTemplate.module.css";
import { classicStores } from "./classicStoreData";
import TemplateGenerationActions from "./TemplateGenerationActions";

interface ClassicMarketIntroTemplateProps {
  marketName?: string;
  totalStores?: string;
  address?: string;
  contact?: string;
  fax?: string;
  emailPrimary?: string;
  emailSecondary?: string;
  previewMode?: boolean;
}

const categories = ["농/수산물", "먹거리", "의류", "생활용품", "기타"];

const bannerItems = [
  { color: "blue" },
  { color: "yellow" },
  { color: "red" },
  { color: "green" },
  { color: "light" },
  { color: "blue" },
  { color: "yellow" },
  { color: "red" },
  { color: "green" },
  { color: "light" },
  { color: "blue" },
  { color: "yellow" },
  { color: "red" },
  { color: "green", label: "시장소개", href: "/templates/classic" },
  { color: "light" },
  { color: "blue", label: "가게정보", href: "/templates/classic/stores" },
  { color: "yellow" },
  { color: "red", label: "관광정보", href: "/templates/classic#tour" },
  { color: "green" },
  { color: "light" },
  { color: "blue", label: "EN / KR" },
  { color: "yellow" },
];

export default function ClassicMarketIntroTemplate({
  marketName = "DIGI-MON 전통시장",
  totalStores = "NN",
  address = "상세주소 text",
  contact = "TELEPHONENUM",
  fax = "FAXNUM",
  emailPrimary = "이메일1",
  emailSecondary = "이메일2",
  previewMode = false,
}: ClassicMarketIntroTemplateProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const visibleStores =
    selectedCategory === "전체"
      ? classicStores
      : classicStores.filter((store) => store.category === selectedCategory);

  return (
    <main className={`${styles.page} ${styles.storePage}`}>
      <header className={styles.topBanner} aria-label="템플릿 메뉴">
        {bannerItems.map((item, index) => (
          <div
            className={`${styles.bannerPiece} ${styles[item.color]}`}
            key={`${item.color}-${index}`}
          >
            {item.label && item.href ? (
              <Link className={styles.bannerLabel} href={item.href}>
                {item.label}
              </Link>
            ) : item.label ? (
              <span className={styles.bannerLabel}>{item.label}</span>
            ) : null}
          </div>
        ))}
      </header>

      <section className={styles.storeHero} aria-label="시장 가게 안내">
        <div className={styles.storeLogoBox}>
          <strong>{marketName}</strong>
        </div>
        <p>우리 시장에서는 {totalStores}개의 다양한 가게들을 만나볼 수 있습니다!</p>
      </section>

      <section className={styles.storeSearchSection} aria-label="가게 검색">
        <h1>CATEGORY</h1>
        <div className={styles.categoryList}>
          {categories.map((category) => (
            <button
              type="button"
              className={selectedCategory === category ? styles.activeCategory : undefined}
              key={category}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <label className={styles.searchBox}>
          <input type="search" placeholder="원하는 매장을 검색해보세요" />
          <span aria-hidden="true" />
        </label>
      </section>

      <section className={styles.storeGrid} id="stores" aria-label="가게 목록">
        {visibleStores.map((store, index) => (
          <Link
            className={styles.storeCard}
            href={`/templates/classic/stores/${store.id}`}
            key={`${store.category}-${index}`}
          >
            <h2>{store.category}</h2>
            <p>{store.name}</p>
          </Link>
        ))}
      </section>

      <footer className={styles.footer}>
        <nav className={styles.footerNav} aria-label="하단 메뉴">
          <Link href="/templates/classic#intro">시장소개</Link>
          <Link href="/templates/classic/stores#stores">가게안내</Link>
          <Link href="/templates/classic#tour">관광정보</Link>
          <Link href="/templates/classic#map">찾아오시는 길</Link>
        </nav>

        <div className={styles.footerInfo}>
          <div>
            <h3>주소</h3>
            <p>{address}</p>
          </div>
          <div>
            <h3>문의</h3>
            <p>TEL : {contact}</p>
            <p>FAX : {fax}</p>
          </div>
          <div>
            <h3>이메일</h3>
            <p>{emailPrimary}</p>
            <p>{emailSecondary}</p>
          </div>
        </div>
      </footer>

      {previewMode && (
        <TemplateGenerationActions
          previewHref="/templates/classic"
          templateType="TEMPLATE_1"
        />
      )}
    </main>
  );
}

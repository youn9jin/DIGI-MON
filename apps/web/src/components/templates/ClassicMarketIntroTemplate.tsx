"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./ClassicMarketTemplate.module.css";
import { classicStores } from "./classicStoreData";
import TemplateGenerationActions from "./TemplateGenerationActions";
import {
  mapStoreToTemplateStore,
  type TemplateStore,
} from "@/lib/template-store-data";

interface ClassicMarketIntroTemplateProps {
  marketName?: string;
  totalStores?: string;
  address?: string;
  contact?: string;
  fax?: string;
  emailPrimary?: string;
  emailSecondary?: string;
  stores?: TemplateStore[];
  publicBasePath?: string;
  previewMode?: boolean;
}

const categories = ["농/수산물", "먹거리", "의류", "생활용품", "기타"];

export default function ClassicMarketIntroTemplate({
  marketName = "Market Name",
  totalStores = "NN",
  address = "상세주소 text",
  contact = "TELEPHONENUM",
  fax = "FAXNUM",
  emailPrimary = "이메일1",
  emailSecondary = "이메일2",
  stores,
  publicBasePath,
  previewMode = false,
}: ClassicMarketIntroTemplateProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [searchKeyword, setSearchKeyword] = useState("");
  const sourceStores = useMemo(
    () => stores ?? classicStores.map((store, index) => mapStoreToTemplateStore(store, index)),
    [stores],
  );
  const visibleStores =
    (selectedCategory === "전체"
      ? sourceStores
      : sourceStores.filter((store) => store.category === selectedCategory)
    ).filter((store) => {
      const keyword = searchKeyword.trim().toLowerCase();
      if (!keyword) return true;
      return [store.name, store.category, store.intro, store.menu]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  const displayTotalStores = totalStores === "NN" && sourceStores.length > 0
    ? String(sourceStores.length)
    : totalStores;
  const getHref = (href: string) => {
    if (!publicBasePath) return href;
    const isPublicMarketPage = publicBasePath.startsWith("/markets/");
    if (href.includes("/stores")) {
      return isPublicMarketPage
        ? `${publicBasePath}/stores`
        : "/templates/classic/stores?preview=design";
    }
    const hash = href.includes("#") ? href.slice(href.indexOf("#")) : "#intro";
    return `${publicBasePath}${hash}`;
  };
  const getStoreHref = (storeId: string) =>
    publicBasePath?.startsWith("/markets/")
      ? `${publicBasePath}/stores/${encodeURIComponent(storeId)}`
      : `/templates/classic/stores/${storeId}`;

  return (
    <main className={`${styles.page} ${styles.storePage}`}>
      <header className={styles.topBanner} aria-label="템플릿 메뉴">
        <nav className={styles.bannerNav}>
          <Link href={getHref("/templates/classic#intro")}>시장소개</Link>
          <Link href={getHref("/templates/classic/stores")}>가게정보</Link>
          <Link href={getHref("/templates/classic#tour")}>관광정보</Link>
          <span>EN/KR</span>
        </nav>
      </header>

      <section className={styles.storeHero} aria-label="시장 가게 안내">
        <div className={styles.storeLogoBox}>
          <strong>{marketName}</strong>
        </div>
        <p>우리 시장에서는 {displayTotalStores}개의 다양한 가게들을 만나볼 수 있습니다!</p>
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
          <input
            type="search"
            placeholder="원하는 매장을 검색해보세요"
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
          />
          <span aria-hidden="true" />
        </label>
      </section>

      <section className={styles.storeGrid} id="stores" aria-label="가게 목록">
        {visibleStores.map((store, index) => (
          <Link
            className={styles.storeCard}
            href={getStoreHref(store.id)}
            key={`${store.category}-${index}`}
          >
            <h2>{store.category}</h2>
            <p>{store.name}</p>
          </Link>
        ))}
      </section>

      <footer className={styles.footer}>
        <nav className={styles.footerNav} aria-label="하단 메뉴">
          <Link href={getHref("/templates/classic#intro")}>시장소개</Link>
          <Link href={getHref("/templates/classic/stores")}>가게안내</Link>
          <Link href={getHref("/templates/classic#tour")}>관광정보</Link>
          <Link href={getHref("/templates/classic#map")}>찾아오시는 길</Link>
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
          templateType="TEMPLATE_3"
        />
      )}
    </main>
  );
}

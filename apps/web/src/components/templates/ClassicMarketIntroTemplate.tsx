"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./ClassicMarketTemplate.module.css";
import { classicStores } from "./classicStoreData";
import TemplateGenerationActions from "./TemplateGenerationActions";
import TemplateLanguageToggle, {
  translateStoreCategory,
  useTemplateLanguage,
} from "./TemplateLanguageToggle";
import {
  getUniqueTemplateStores,
  mapStoreToTemplateStore,
  type TemplateStore,
} from "@/lib/template-store-data";

interface ClassicMarketIntroTemplateProps {
  marketName?: string;
  logoImageUrl?: string;
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
  logoImageUrl,
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
  const { language, t } = useTemplateLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [searchKeyword, setSearchKeyword] = useState("");
  const sourceStores = useMemo(
    () =>
      getUniqueTemplateStores(
        stores ??
          classicStores.map((store, index) =>
            mapStoreToTemplateStore(store, index),
          ),
      ),
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
          <Link href={getHref("/templates/classic#intro")}>{t("marketIntro")}</Link>
          <Link href={getHref("/templates/classic/stores")}>{t("storeInfo")}</Link>
          <Link href={getHref("/templates/classic#tour")}>{t("tourInfo")}</Link>
          <TemplateLanguageToggle />
        </nav>
      </header>

      <section className={styles.storeHero} aria-label="시장 가게 안내">
        <div
          className={`${styles.storeLogoBox} ${logoImageUrl ? styles.storeLogoBoxImage : ""}`}
          style={logoImageUrl ? { backgroundImage: `url(${logoImageUrl})` } : undefined}
        >
          {!logoImageUrl && <strong>{marketName}</strong>}
        </div>
        <p>
          {language === "en"
            ? `Explore ${displayTotalStores} stores in our market.`
            : `우리 시장에서는 ${displayTotalStores}개의 다양한 가게들을 만나볼 수 있습니다!`}
        </p>
      </section>

      <section className={styles.storeSearchSection} aria-label="가게 검색">
        <h1>{language === "en" ? "CATEGORY" : "카테고리"}</h1>
        <div className={styles.categoryList}>
          {categories.map((category) => (
            <button
              type="button"
              className={selectedCategory === category ? styles.activeCategory : undefined}
              key={category}
              onClick={() => setSelectedCategory(category)}
            >
              {translateStoreCategory(category, language)}
            </button>
          ))}
        </div>
        <label className={styles.searchBox}>
          <input
            type="search"
            placeholder={t("searchStore")}
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
            <h2>{translateStoreCategory(store.category, language)}</h2>
            <p>{store.name}</p>
          </Link>
        ))}
      </section>

      <footer className={styles.footer}>
        <nav className={styles.footerNav} aria-label="하단 메뉴">
          <Link href={getHref("/templates/classic#intro")}>{t("marketIntro")}</Link>
          <Link href={getHref("/templates/classic/stores")}>{t("shopGuide")}</Link>
          <Link href={getHref("/templates/classic#tour")}>{t("tourInfo")}</Link>
          <Link href={getHref("/templates/classic#map")}>{t("directions")}</Link>
        </nav>

        <div className={styles.footerInfo}>
          <div>
            <h3>{t("address")}</h3>
            <p>{address}</p>
          </div>
          <div>
            <h3>{t("contact")}</h3>
            <p>TEL : {contact}</p>
            <p>FAX : {fax}</p>
          </div>
          <div>
            <h3>{t("email")}</h3>
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

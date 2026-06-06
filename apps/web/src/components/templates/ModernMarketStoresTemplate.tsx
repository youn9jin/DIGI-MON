"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import TemplateGenerationActions from "./TemplateGenerationActions";
import TemplateLanguageToggle, {
  translateStoreCategory,
  useTemplateLanguage,
} from "./TemplateLanguageToggle";
import { classicStores } from "./classicStoreData";
import styles from "./ModernMarketTemplate.module.css";
import {
  getUniqueTemplateStores,
  mapStoreToTemplateStore,
  type TemplateStore,
} from "@/lib/template-store-data";

const imgMarketMainPhoto = "/images/templates/preview/editorial-hero.png";

interface ModernMarketStoresTemplateProps {
  marketName?: string;
  address?: string;
  contact?: string;
  stores?: TemplateStore[];
  heroImageUrl?: string;
  previewMode?: boolean;
  publicBasePath?: string;
}

const categories = ["농/수산물", "먹거리", "의류", "생활용품", "기타"];

export default function ModernMarketStoresTemplate({
  marketName = "Market Name",
  address = "상세주소 text",
  contact = "TELEPHONENUM",
  stores,
  heroImageUrl,
  previewMode = false,
  publicBasePath,
}: ModernMarketStoresTemplateProps) {
  const { language, t } = useTemplateLanguage();
  const [selectedCategory, setSelectedCategory] = useState("전체");
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
    selectedCategory === "전체"
      ? sourceStores
      : sourceStores.filter((store) => store.category === selectedCategory);
  const previewSuffix = publicBasePath ? "?preview=design" : "";
  const getHref = (href: string) => {
    if (!publicBasePath) return href;
    const isPublicMarketPage = publicBasePath.startsWith("/markets/");
    if (href.includes("/stores")) {
      return isPublicMarketPage
        ? `${publicBasePath}/stores`
        : "/templates/modern/stores?preview=design";
    }
    const hash = href.includes("#") ? href.slice(href.indexOf("#")) : "#intro";
    return `${publicBasePath}${hash}`;
  };
  const getStoreHref = (storeId: string) =>
    publicBasePath?.startsWith("/markets/")
      ? `${publicBasePath}/stores/${encodeURIComponent(storeId)}`
      : `/templates/modern/stores/${storeId}${previewSuffix}`;
  const navItems = [
    { label: t("marketIntro"), href: "/templates/modern" },
    { label: t("storeGuide"), href: "/templates/modern/stores" },
    { label: t("tourInfoSpaced"), href: "/templates/modern#tour" },
  ];

  return (
    <main className={`${styles.page} ${styles.storeGuidePage}`}>
      <header className={styles.header}>
        <Link className={styles.brand} href={publicBasePath ?? "/templates/modern"}>
          {marketName}
        </Link>
        <nav aria-label="템플릿 메뉴">
          {navItems.map((item) => (
            <Link href={getHref(item.href)} key={item.label}>
              {item.label}
            </Link>
          ))}
          <TemplateLanguageToggle />
        </nav>
      </header>

      <section className={styles.storeGuideHero} aria-label="점포 안내">
        {heroImageUrl ? (
          <span
            className={styles.storeGuideHeroImageDynamic}
            style={{ backgroundImage: `url(${heroImageUrl})` }}
          />
        ) : (
          <Image
            alt=""
            src={imgMarketMainPhoto}
            width={1920}
            height={603}
            className={styles.storeGuideHeroImage}
            priority
          />
        )}
        <div />
        <article>
          <h1>{t("findStore")}</h1>
          <p>{t("findStoreDescription")}</p>
        </article>
      </section>

      <section className={styles.modernCategorySection} aria-label="카테고리 검색">
        <h2>{language === "en" ? "CATEGORY" : "카테고리"}</h2>
        <div className={styles.modernCategoryList}>
          {categories.map((category) => (
            <button
              className={selectedCategory === category ? styles.activeModernCategory : undefined}
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
            >
              {translateStoreCategory(category, language)}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.modernStoreGrid} aria-label="점포 목록">
        {visibleStores.map((store, index) => (
          <Link
            className={styles.modernStoreCard}
            href={getStoreHref(store.id)}
            key={`${store.id}-${index}`}
          >
            <span>{translateStoreCategory(store.category, language)}</span>
            <h3>{store.name}</h3>
            <p>{store.intro}</p>
          </Link>
        ))}
      </section>

      <footer className={styles.footer}>
        <nav aria-label="하단 메뉴">
          <Link href={getHref("/templates/modern#intro")}>{t("marketIntro")}</Link>
          <Link href={getHref("/templates/modern/stores")}>{t("shopGuide")}</Link>
          <Link href={getHref("/templates/modern#tour")}>{t("tourInfo")}</Link>
          <Link href={getHref("/templates/modern#map")}>{t("directions")}</Link>
        </nav>
        <div className={styles.footerInfo}>
          <div>
            <h3>{t("address")}</h3>
            <p>{address}</p>
          </div>
          <div>
            <h3>{t("contact")}</h3>
            <p>TEL : {contact}</p>
            <p>FAX : FAXNUM</p>
          </div>
          <div>
            <h3>{t("email")}</h3>
            <p>이메일1</p>
            <p>이메일2</p>
          </div>
        </div>
      </footer>

      {previewMode && (
        <TemplateGenerationActions
          previewHref="/templates/modern"
          templateType="TEMPLATE_2"
        />
      )}
    </main>
  );
}

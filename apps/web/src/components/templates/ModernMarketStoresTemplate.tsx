"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import TemplateGenerationActions from "./TemplateGenerationActions";
import { classicStores } from "./classicStoreData";
import styles from "./ModernMarketTemplate.module.css";
import {
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

const navItems = [
  { label: "시장소개", href: "/templates/modern" },
  { label: "점포 안내", href: "/templates/modern/stores" },
  { label: "관광 정보", href: "/templates/modern#tour" },
];

export default function ModernMarketStoresTemplate({
  marketName = "Market Name",
  address = "상세주소 text",
  contact = "TELEPHONENUM",
  stores,
  heroImageUrl,
  previewMode = false,
  publicBasePath,
}: ModernMarketStoresTemplateProps) {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const sourceStores = useMemo(
    () => stores ?? classicStores.map((store, index) => mapStoreToTemplateStore(store, index)),
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
          <span>EN | KR</span>
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
          <h1>가게 찾기</h1>
          <p>가게들을 카테고리 별로 확인해보세요</p>
        </article>
      </section>

      <section className={styles.modernCategorySection} aria-label="카테고리 검색">
        <h2>CATEGORY</h2>
        <div className={styles.modernCategoryList}>
          {categories.map((category) => (
            <button
              className={selectedCategory === category ? styles.activeModernCategory : undefined}
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
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
            <span>{store.category}</span>
            <h3>{store.name}</h3>
            <p>{store.intro}</p>
          </Link>
        ))}
      </section>

      <footer className={styles.footer}>
        <nav aria-label="하단 메뉴">
          <Link href={getHref("/templates/modern#intro")}>시장소개</Link>
          <Link href={getHref("/templates/modern/stores")}>가게안내</Link>
          <Link href={getHref("/templates/modern#tour")}>관광정보</Link>
          <Link href={getHref("/templates/modern#map")}>찾아오시는 길</Link>
        </nav>
        <div className={styles.footerInfo}>
          <div>
            <h3>주소</h3>
            <p>{address}</p>
          </div>
          <div>
            <h3>문의</h3>
            <p>TEL : {contact}</p>
            <p>FAX : FAXNUM</p>
          </div>
          <div>
            <h3>이메일</h3>
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

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
import {
  getUniqueTemplateStores,
  mapStoreToTemplateStore,
  type TemplateStore,
} from "@/lib/template-store-data";
import styles from "./EditorialMarketTemplate.module.css";

const heroImage = "/images/templates/preview/editorial-store-hero.png";

interface EditorialMarketStoresTemplateProps {
  marketName?: string;
  address?: string;
  contact?: string;
  stores?: TemplateStore[];
  heroImageUrl?: string;
  previewMode?: boolean;
  publicBasePath?: string;
}

const categories = ["농/수산물", "먹거리", "의류", "생활용품", "기타"];

export default function EditorialMarketStoresTemplate({
  marketName = "Market Name",
  address = "상세주소 text",
  contact = "TELEPHONENUM",
  stores: storeItems,
  heroImageUrl,
  previewMode = false,
  publicBasePath,
}: EditorialMarketStoresTemplateProps) {
  const { language, t } = useTemplateLanguage();
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchTerm, setSearchTerm] = useState("");

  const sourceStores = useMemo(
    () =>
      getUniqueTemplateStores(
        storeItems ??
          classicStores.map((store, index) =>
            mapStoreToTemplateStore(store, index),
          ),
      ),
    [storeItems],
  );
  const stores = useMemo(() => {
    return sourceStores.filter((store) => {
      const matchesCategory =
        selectedCategory === "전체" || store.category === selectedCategory;
      const keyword = searchTerm.trim();
      const matchesSearch =
        !keyword ||
        store.name.includes(keyword) ||
        store.category.includes(keyword) ||
        store.intro.includes(keyword) ||
        store.menu.includes(keyword);

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory, sourceStores]);
  const previewSuffix = publicBasePath ? "?preview=design" : "";
  const getStoreHref = (storeId: string) => {
    if (publicBasePath?.startsWith("/markets/")) {
      return `${publicBasePath}/stores/${encodeURIComponent(storeId)}`;
    }
    return `/templates/editorial/stores/${encodeURIComponent(storeId)}${previewSuffix}`;
  };

  return (
    <main className={styles.page}>
      <EditorialHeaderWithBasePath
        marketName={marketName}
        publicBasePath={publicBasePath}
      />

      <section className={styles.storeHero} aria-label="점포 찾기">
        {heroImageUrl ? (
          <span
            className={styles.dynamicHeroImage}
            style={{ backgroundImage: `url(${heroImageUrl})` }}
            aria-hidden="true"
          />
        ) : (
          <Image
            alt=""
            className={styles.heroImage}
            fill
            priority
            sizes="100vw"
            src={heroImage}
          />
        )}
        <div className={styles.heroOverlay} />
        <div className={styles.storeHeroTitle}>
          <h1>{t("findStorePoint")}</h1>
          <span />
        </div>
        <label className={styles.searchBox}>
          {!searchTerm && <span>{t("searchStoreName")}</span>}
          <input
            aria-label="가게 이름 검색"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <i aria-hidden="true" />
        </label>
      </section>

      <section className={styles.categorySection} aria-label="카테고리">
        <h2>{language === "en" ? "CATEGORY" : "카테고리"}</h2>
        <p>{t("categoryDescription")}</p>
        <div className={styles.categoryButtons}>
          {categories.map((category) => (
            <button
              className={selectedCategory === category ? styles.activeCategory : undefined}
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
            >
              {translateStoreCategory(category, language)}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.editorialStoreGrid} aria-label="점포 목록">
        {stores.map((store) => (
          <Link
            className={styles.editorialStoreCard}
            href={getStoreHref(store.id)}
            key={store.id}
          >
            <strong>{translateStoreCategory(store.category, language)}</strong>
            <span>{store.name}</span>
          </Link>
        ))}
      </section>

      <EditorialFooter
        address={address}
        contact={contact}
        publicBasePath={publicBasePath}
      />

      {previewMode && (
        <TemplateGenerationActions
          previewHref="/templates/editorial"
          templateType="TEMPLATE_1"
        />
      )}
    </main>
  );
}

export function EditorialHeader({
  marketName,
  publicBasePath,
}: {
  marketName: string;
  publicBasePath?: string;
}) {
  return (
    <EditorialHeaderWithBasePath
      marketName={marketName}
      publicBasePath={publicBasePath}
    />
  );
}

export function EditorialHeaderWithBasePath({
  marketName,
  publicBasePath,
}: {
  marketName: string;
  publicBasePath?: string;
}) {
  const { t } = useTemplateLanguage();
  const getHref = (href: string) => {
    if (!publicBasePath) return href;
    if (href.includes("/stores")) {
      return publicBasePath.startsWith("/markets/")
        ? `${publicBasePath}/stores`
        : `/templates/editorial/stores?preview=design`;
    }
    const hash = href.includes("#") ? href.slice(href.indexOf("#")) : "#intro";
    return `${publicBasePath}${hash}`;
  };
  const navItems = [
    { label: t("information"), href: "/templates/editorial#intro" },
    { label: t("storeGuide"), href: "/templates/editorial/stores" },
    { label: t("tourInfoSpaced"), href: "/templates/editorial#culture" },
  ];

  return (
    <header className={styles.header}>
      <Link className={styles.logo} href={publicBasePath ?? "/templates/editorial"}>
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
  );
}

export function EditorialFooter({
  address,
  contact,
  publicBasePath,
}: {
  address: string;
  contact: string;
  publicBasePath?: string;
}) {
  const { t } = useTemplateLanguage();
  const getHref = (href: string) => {
    if (!publicBasePath) return href;
    if (href.includes("/stores")) {
      return publicBasePath.startsWith("/markets/")
        ? `${publicBasePath}/stores`
        : `/templates/editorial/stores?preview=design`;
    }
    const hash = href.includes("#") ? href.slice(href.indexOf("#")) : "#intro";
    return `${publicBasePath}${hash}`;
  };

  return (
    <footer className={styles.footer}>
      <nav aria-label="하단 메뉴">
        <Link href={getHref("/templates/editorial#intro")}>{t("marketIntro")}</Link>
        <Link href={getHref("/templates/editorial/stores")}>{t("shopGuide")}</Link>
        <Link href={getHref("/templates/editorial#culture")}>{t("tourInfo")}</Link>
        <Link href={getHref("/templates/editorial#map")}>{t("directions")}</Link>
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
  );
}

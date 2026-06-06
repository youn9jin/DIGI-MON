"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import TemplateGenerationActions from "./TemplateGenerationActions";
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
          <h1>점포 찾기</h1>
          <span />
        </div>
        <label className={styles.searchBox}>
          {!searchTerm && <span>찾고싶은 가게 이름을 입력하세요</span>}
          <input
            aria-label="가게 이름 검색"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <i aria-hidden="true" />
        </label>
      </section>

      <section className={styles.categorySection} aria-label="카테고리">
        <h2>CATEGORY</h2>
        <p>카테고리를 선택하시면 해당하는 가게를 확인하실 수 있습니다.</p>
        <div className={styles.categoryButtons}>
          {categories.map((category) => (
            <button
              className={selectedCategory === category ? styles.activeCategory : undefined}
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
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
            <strong>{store.category}</strong>
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
    { label: "정보 안내", href: "/templates/editorial#intro" },
    { label: "점포 안내", href: "/templates/editorial/stores" },
    { label: "관광 정보", href: "/templates/editorial#culture" },
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
        <Link href={getHref("/templates/editorial#intro")}>시장소개</Link>
        <Link href={getHref("/templates/editorial/stores")}>가게안내</Link>
        <Link href={getHref("/templates/editorial#culture")}>관광정보</Link>
        <Link href={getHref("/templates/editorial#map")}>찾아오시는 길</Link>
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
  );
}

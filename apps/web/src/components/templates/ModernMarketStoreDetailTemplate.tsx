"use client";

import Image from "next/image";
import Link from "next/link";
import TemplateGenerationActions from "./TemplateGenerationActions";
import styles from "./ModernMarketTemplate.module.css";
import type { TemplateStore } from "@/lib/template-store-data";

const imgMarketMainPhoto = "/images/templates/preview/modern-store-detail-hero.png";

interface ModernMarketStoreDetailTemplateProps {
  store: TemplateStore;
  marketName?: string;
  address?: string;
  contact?: string;
  heroImageUrl?: string;
  previewMode?: boolean;
  publicBasePath?: string;
}

const navItems = [
  { label: "시장 소개", href: "/templates/modern" },
  { label: "점포 안내", href: "/templates/modern/stores" },
  { label: "관광 정보", href: "/templates/modern#tour" },
];

export default function ModernMarketStoreDetailTemplate({
  store,
  marketName = "Market Name",
  address = "상세주소 text",
  contact = "TELEPHONENUM",
  heroImageUrl,
  previewMode = false,
  publicBasePath,
}: ModernMarketStoreDetailTemplateProps) {
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

  return (
    <main className={`${styles.page} ${styles.modernStoreDetailPage}`}>
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

      <section className={styles.modernStoreDetailHero} aria-label="가게 상세">
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
          <h1>{store.name}</h1>
          <p>가게 한줄 소개 : {store.intro}</p>
          <ul>
            <li>영업 시간 : {store.hours}</li>
            <li>가게 전화번호 : {store.phone}</li>
            <li>주요 메뉴 : {store.menu}</li>
          </ul>
        </article>
        <div className={styles.modernDetailActions}>
          <button type="button">수정</button>
          <button type="button">삭제</button>
        </div>
      </section>

      <section className={styles.modernDetailGallery} aria-label="가게 사진">
        <div>
          <h2>가게 메뉴판 보기</h2>
          <div className={styles.menuBoardGrid}>
            <div />
            <div />
          </div>
        </div>

        <div>
          <h2>가게 대표 음식 보기</h2>
          <div className={styles.foodGrid}>
            <div />
            <div />
            <div />
            <div />
          </div>
        </div>
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

"use client";

import Link from "next/link";
import styles from "./ClassicMarketTemplate.module.css";
import TemplateGenerationActions from "./TemplateGenerationActions";
import type { TemplateStore } from "@/lib/template-store-data";

interface ClassicMarketStoreDetailTemplateProps {
  store: TemplateStore;
  address?: string;
  contact?: string;
  fax?: string;
  emailPrimary?: string;
  emailSecondary?: string;
  publicBasePath?: string;
  previewMode?: boolean;
}

export default function ClassicMarketStoreDetailTemplate({
  store,
  address = "상세주소 text",
  contact = "TELEPHONENUM",
  fax = "FAXNUM",
  emailPrimary = "이메일1",
  emailSecondary = "이메일2",
  publicBasePath,
  previewMode = false,
}: ClassicMarketStoreDetailTemplateProps) {
  const mainPhotoUrl = store.storeImageUrls[0] ?? store.productImageUrls[0];
  const detailPhotoUrls = [
    ...store.productImageUrls,
    ...store.storeImageUrls,
    ...store.menuImageUrls,
  ].filter((url) => url !== mainPhotoUrl).slice(0, 3);
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

  return (
    <main className={`${styles.page} ${styles.storeDetailPage}`}>
      <header className={styles.topBanner} aria-label="템플릿 메뉴">
        <nav className={styles.bannerNav}>
          <Link href={getHref("/templates/classic#intro")}>시장소개</Link>
          <Link href={getHref("/templates/classic/stores")}>가게정보</Link>
          <Link href={getHref("/templates/classic#tour")}>관광정보</Link>
          <span>EN/KR</span>
        </nav>
      </header>

      <section className={styles.detailHero} aria-label="가게 대표 정보">
        <h1>{store.category}</h1>
        <p>{store.name}</p>
      </section>

      <section className={styles.detailIntro} aria-label="가게 소개">
        <div className={styles.detailActions}>
          <button type="button">수정</button>
          <button type="button">삭제</button>
        </div>
        <h2>{store.name}</h2>
        <p>{store.intro}</p>
      </section>

      <section className={styles.detailContent} aria-label="가게 상세 정보">
        <div
          className={styles.storeMainPhoto}
          style={mainPhotoUrl ? { backgroundImage: `url(${mainPhotoUrl})` } : undefined}
        />

        <dl className={styles.storeInfoList}>
          <div>
            <dt>영업시간</dt>
            <dd>{store.hours}</dd>
          </div>
          <div>
            <dt>가게 연락처</dt>
            <dd>{store.phone}</dd>
          </div>
          <div>
            <dt>주요 메뉴</dt>
            <dd>{store.menu}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.detailPhotos} aria-label="가게 사진">
        {Array.from({ length: 3 }).map((_, index) => {
          const imageUrl = detailPhotoUrls[index];
          return (
            <div
              key={index}
              style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
            />
          );
        })}
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

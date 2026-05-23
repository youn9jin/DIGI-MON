"use client";

import Link from "next/link";
import styles from "./ClassicMarketTemplate.module.css";
import type { ClassicStore } from "./classicStoreData";
import TemplateGenerationActions from "./TemplateGenerationActions";

interface ClassicMarketStoreDetailTemplateProps {
  store: ClassicStore;
  address?: string;
  contact?: string;
  fax?: string;
  emailPrimary?: string;
  emailSecondary?: string;
  previewMode?: boolean;
}

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

export default function ClassicMarketStoreDetailTemplate({
  store,
  address = "상세주소 text",
  contact = "TELEPHONENUM",
  fax = "FAXNUM",
  emailPrimary = "이메일1",
  emailSecondary = "이메일2",
  previewMode = false,
}: ClassicMarketStoreDetailTemplateProps) {
  return (
    <main className={`${styles.page} ${styles.storeDetailPage}`}>
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
        <div className={styles.storeMainPhoto} />

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
        <div />
        <div />
        <div />
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

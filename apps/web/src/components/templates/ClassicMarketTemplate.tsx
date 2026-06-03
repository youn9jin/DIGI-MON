"use client";

import Link from "next/link";
import styles from "./ClassicMarketTemplate.module.css";
import OpenStreetMapEmbed from "./OpenStreetMapEmbed";
import TemplateGenerationActions from "./TemplateGenerationActions";

export interface ClassicMarketTemplateData {
  marketName: string;
  intro: string;
  address: string;
  contact: string;
  fax: string;
  emailPrimary: string;
  emailSecondary: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBody: string;
  secondTitle: string;
  secondSubtitle: string;
  secondBody: string;
  heroImageUrl?: string;
  logoImageUrl?: string;
  introImageUrls?: string[];
}

const DEFAULT_DATA: ClassicMarketTemplateData = {
  marketName: "Market Name",
  intro: "시장만의 매력과 대표 먹거리, 상점 정보를 한눈에 볼 수 있는 전통시장 웹사이트입니다.",
  address: "서울특별시 중구 전통시장로 12",
  contact: "02-0000-0000",
  fax: "02-0000-0001",
  emailPrimary: "hello@digimon.market",
  emailSecondary: "support@digimon.market",
  heroTitle: "BOLDTEXT_TITLE1",
  heroSubtitle: "EXPLAIN_TITLE2",
  heroBody:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
  secondTitle: "BOLDTEXT_TITLE1",
  secondSubtitle: "EXPLAIN_TITLE2",
  secondBody:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
};

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

interface ClassicMarketTemplateProps {
  data?: Partial<ClassicMarketTemplateData>;
  previewMode?: boolean;
  publicBasePath?: string;
}

export default function ClassicMarketTemplate({
  data,
  previewMode = false,
  publicBasePath,
}: ClassicMarketTemplateProps) {
  const content = { ...DEFAULT_DATA, ...data };
  const introImageUrls = content.introImageUrls ?? [];
  const secondIntroImageUrl = introImageUrls[1] ?? introImageUrls[0];
  const getHref = (href: string) => {
    if (!publicBasePath) return href;
    if (href.includes("/stores")) return `${publicBasePath}#stores`;
    const hash = href.includes("#") ? href.slice(href.indexOf("#")) : "#intro";
    return `${publicBasePath}${hash}`;
  };

  return (
    <main className={styles.page}>
      <header className={styles.topBanner} aria-label="템플릿 메뉴">
        {bannerItems.map((item, index) => (
          <div
            className={`${styles.bannerPiece} ${styles[item.color]}`}
            key={`${item.color}-${index}`}
          >
            {item.label && item.href ? (
              <Link className={styles.bannerLabel} href={getHref(item.href)}>
                {item.label}
              </Link>
            ) : item.label ? (
              <span className={styles.bannerLabel}>{item.label}</span>
            ) : null}
          </div>
        ))}
      </header>

      <section className={styles.logoIntro} id="intro" aria-label="시장 소개">
        <div
          className={`${styles.logoBox} ${content.logoImageUrl ? styles.logoBoxImage : ""}`}
          style={
            content.logoImageUrl
              ? { backgroundImage: `url(${content.logoImageUrl})` }
              : undefined
          }
        >
          {!content.logoImageUrl && <strong>{content.marketName}</strong>}
        </div>
        <p>{content.intro}</p>
      </section>

      <section className={styles.featureRow}>
        <div
          className={styles.photoBlock}
          style={
            content.heroImageUrl
              ? { backgroundImage: `url(${content.heroImageUrl})` }
              : undefined
          }
          aria-label="시장 대표 이미지"
        />
        <article className={styles.textBlock}>
          <h1>{content.heroTitle}</h1>
          <h2>{content.heroSubtitle}</h2>
          <p>{content.heroBody}</p>
        </article>
      </section>

      <section className={`${styles.featureRow} ${styles.reversed}`} id="tour">
        <article className={styles.textBlock}>
          <h1>{content.secondTitle}</h1>
          <h2>{content.secondSubtitle}</h2>
          <p>{content.secondBody}</p>
        </article>
        <div
          className={styles.photoBlock}
          style={
            secondIntroImageUrl
              ? { backgroundImage: `url(${secondIntroImageUrl})` }
              : undefined
          }
          aria-label="시장 상세 이미지"
        />
      </section>

      <section className={styles.mapSection} id="map" aria-label="찾아오시는 길">
        <h2>찾아오시는 길</h2>
        <OpenStreetMapEmbed address={content.address} label={content.marketName} />
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
            <p>{content.address}</p>
          </div>
          <div>
            <h3>문의</h3>
            <p>TEL : {content.contact}</p>
            <p>FAX : {content.fax}</p>
          </div>
          <div>
            <h3>이메일</h3>
            <p>{content.emailPrimary}</p>
            <p>{content.emailSecondary}</p>
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

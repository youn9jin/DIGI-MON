"use client";

import Link from "next/link";
import TemplateGenerationActions from "./TemplateGenerationActions";
import styles from "./ModernMarketTemplate.module.css";

export interface ModernMarketTemplateData {
  marketName: string;
  intro: string;
  address: string;
  contact: string;
  hours: string;
  heroTitle: string;
  heroSubtitle: string;
  featureTitle: string;
  featureBody: string;
  secondFeatureTitle: string;
  secondFeatureBody: string;
  heroImageUrl?: string;
  logoImageUrl?: string;
  introImageUrl?: string;
}

const DEFAULT_DATA: ModernMarketTemplateData = {
  marketName: "Market Name",
  intro:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
  address: "서울특별시 중구 전통시장로 12",
  contact: "02-0000-0000",
  hours: "평일 09:00 - 21:00",
  heroTitle: "Market Name",
  heroSubtitle:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy.",
  featureTitle: "BOLD TEXT1",
  featureBody:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
  secondFeatureTitle: "BOLD TEXT1",
  secondFeatureBody:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
};

const navItems = [
  { label: "시장소개", href: "/templates/modern" },
  { label: "점포 안내", href: "/templates/modern/stores" },
  { label: "관광 정보", href: "#tour" },
];

interface ModernMarketTemplateProps {
  data?: Partial<ModernMarketTemplateData>;
  previewMode?: boolean;
  publicBasePath?: string;
}

export default function ModernMarketTemplate({
  data,
  previewMode = false,
  publicBasePath,
}: ModernMarketTemplateProps) {
  const content = { ...DEFAULT_DATA, ...data };
  const getHref = (href: string) => {
    if (!publicBasePath) return href;
    if (href.includes("/stores")) return `${publicBasePath}#stores`;
    if (href.startsWith("#")) return `${publicBasePath}${href}`;
    const hash = href.includes("#") ? href.slice(href.indexOf("#")) : "#intro";
    return `${publicBasePath}${hash}`;
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href={publicBasePath ?? "/templates/modern"}>
          {content.marketName}
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

      <section className={styles.hero} id="intro" aria-label="시장 소개">
        <div>
          <h1>{content.heroTitle}</h1>
          <p>{content.heroSubtitle}</p>
        </div>
      </section>

      <section className={styles.introSection} aria-label="시장 소개 상세">
        <div className={styles.sectionTitle}>
          <h2>시장 소개</h2>
          <span />
        </div>

        <div className={styles.photoStrip}>
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              style={
                content.introImageUrl
                  ? { backgroundImage: `url(${content.introImageUrl})` }
                  : undefined
              }
            />
          ))}
        </div>

        <div className={styles.introText}>
          <p>{content.intro}</p>
          <p>{content.intro}</p>
        </div>
      </section>

      <section className={styles.featureRows} id="stores" aria-label="점포 안내">
        <div className={styles.featureRow}>
          <div
            className={styles.featurePhoto}
            style={
              content.heroImageUrl
                ? { backgroundImage: `url(${content.heroImageUrl})` }
                : undefined
            }
          />
          <article>
            <h2>{content.featureTitle}</h2>
            <p>{content.featureBody}</p>
          </article>
        </div>

        <div className={`${styles.featureRow} ${styles.featureRowReverse}`} id="tour">
          <article>
            <h2>{content.secondFeatureTitle}</h2>
            <p>{content.secondFeatureBody}</p>
          </article>
          <div
            className={styles.featurePhoto}
            style={
              content.introImageUrl
                ? { backgroundImage: `url(${content.introImageUrl})` }
                : undefined
            }
          />
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
            <p>{content.address}</p>
          </div>
          <div>
            <h3>문의</h3>
            <p>TEL : {content.contact}</p>
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

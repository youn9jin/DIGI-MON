"use client";

import Link from "next/link";
import TemplateGenerationActions from "./TemplateGenerationActions";
import TemplateLanguageToggle, {
  useTemplateLanguage,
} from "./TemplateLanguageToggle";
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
  introImageUrls?: string[];
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
  const { t } = useTemplateLanguage();
  const content = { ...DEFAULT_DATA, ...data };
  const introImageUrls = content.introImageUrls ?? [];
  const getIntroImageUrl = (index: number) => introImageUrls[index] ?? introImageUrls[0];
  const getHref = (href: string) => {
    if (!publicBasePath) return href;
    const isPublicMarketPage = publicBasePath.startsWith("/markets/");
    if (href.includes("/stores")) {
      return isPublicMarketPage
        ? `${publicBasePath}/stores`
        : "/templates/modern/stores?preview=design";
    }
    if (href.startsWith("#")) return `${publicBasePath}${href}`;
    const hash = href.includes("#") ? href.slice(href.indexOf("#")) : "#intro";
    return `${publicBasePath}${hash}`;
  };
  const navItems = [
    { label: t("marketIntro"), href: "/templates/modern" },
    { label: t("storeGuide"), href: "/templates/modern/stores" },
    { label: t("tourInfoSpaced"), href: "#tour" },
  ];

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
          <TemplateLanguageToggle />
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
          <h2>{t("marketIntroSpaced")}</h2>
          <span />
        </div>

        <div className={styles.photoStrip}>
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              style={
                getIntroImageUrl(index)
                  ? { backgroundImage: `url(${getIntroImageUrl(index)})` }
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
              getIntroImageUrl(1)
                ? { backgroundImage: `url(${getIntroImageUrl(1)})` }
                : undefined
            }
          />
        </div>
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
            <p>{content.address}</p>
          </div>
          <div>
            <h3>{t("contact")}</h3>
            <p>TEL : {content.contact}</p>
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

"use client";

import Image from "next/image";
import Link from "next/link";
import TemplateGenerationActions from "./TemplateGenerationActions";
import TemplateLanguageToggle, {
  useTemplateLanguage,
} from "./TemplateLanguageToggle";
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

export default function ModernMarketStoreDetailTemplate({
  store,
  marketName = "Market Name",
  address = "상세주소 text",
  contact = "TELEPHONENUM",
  heroImageUrl,
  previewMode = false,
  publicBasePath,
}: ModernMarketStoreDetailTemplateProps) {
  const { t } = useTemplateLanguage();
  const representativeImageUrl = store.storeImageUrls[0] ?? heroImageUrl;
  const menuImageUrls = store.menuImageUrls.slice(0, 2);
  const foodImageUrls = [
    ...store.productImageUrls,
    ...store.storeImageUrls.filter((url) => url !== representativeImageUrl),
  ].slice(0, 4);
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
  const navItems = [
    { label: t("marketIntroSpaced"), href: "/templates/modern" },
    { label: t("storeGuide"), href: "/templates/modern/stores" },
    { label: t("tourInfoSpaced"), href: "/templates/modern#tour" },
  ];

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
          <TemplateLanguageToggle />
        </nav>
      </header>

      <section className={styles.modernStoreDetailHero} aria-label="가게 상세">
        {representativeImageUrl ? (
          <span
            className={styles.storeGuideHeroImageDynamic}
            style={{ backgroundImage: `url(${representativeImageUrl})` }}
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
          <p>{t("storeIntro")} : {store.intro}</p>
          <ul>
            <li>{t("businessHours")} : {store.hours}</li>
            <li>{t("storePhone")} : {store.phone}</li>
            <li>{t("mainMenu")} : {store.menu}</li>
          </ul>
        </article>
      </section>

      <section className={styles.modernDetailGallery} aria-label="가게 사진">
        <div>
          <h2>{t("menuBoard")}</h2>
          <div className={styles.menuBoardGrid}>
            {Array.from({ length: 2 }).map((_, index) => {
              const imageUrl = menuImageUrls[index];
              return (
                <div
                  key={index}
                  style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
                />
              );
            })}
          </div>
        </div>

        <div>
          <h2>{t("featuredFood")}</h2>
          <div className={styles.foodGrid}>
            {Array.from({ length: 4 }).map((_, index) => {
              const imageUrl = foodImageUrls[index];
              return (
                <div
                  key={index}
                  style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
                />
              );
            })}
          </div>
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

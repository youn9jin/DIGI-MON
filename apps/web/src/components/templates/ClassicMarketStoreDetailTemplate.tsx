"use client";

import Link from "next/link";
import styles from "./ClassicMarketTemplate.module.css";
import TemplateGenerationActions from "./TemplateGenerationActions";
import TemplateLanguageToggle, {
  translateStoreCategory,
  useTemplateLanguage,
} from "./TemplateLanguageToggle";
import {
  getDefaultStoreImage,
  type TemplateStore,
} from "@/lib/template-store-data";

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
  const { language, t } = useTemplateLanguage();
  const mainPhotoUrl =
    store.storeImageUrls[0] ??
    store.productImageUrls[0] ??
    getDefaultStoreImage(store.category);
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
          <Link href={getHref("/templates/classic#intro")}>{t("marketIntro")}</Link>
          <Link href={getHref("/templates/classic/stores")}>{t("storeInfo")}</Link>
          <Link href={getHref("/templates/classic#tour")}>{t("tourInfo")}</Link>
          <TemplateLanguageToggle />
        </nav>
      </header>

      <section className={styles.detailHero} aria-label="가게 대표 정보">
        <h1>{translateStoreCategory(store.category, language)}</h1>
        <p>{store.name}</p>
      </section>

      <section className={styles.detailIntro} aria-label="가게 소개">
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
            <dt>{t("businessHours")}</dt>
            <dd>{store.hours}</dd>
          </div>
          <div>
            <dt>{t("storeContact")}</dt>
            <dd>{store.phone}</dd>
          </div>
          <div>
            <dt>{t("mainMenu")}</dt>
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
          <Link href={getHref("/templates/classic#intro")}>{t("marketIntro")}</Link>
          <Link href={getHref("/templates/classic/stores")}>{t("shopGuide")}</Link>
          <Link href={getHref("/templates/classic#tour")}>{t("tourInfo")}</Link>
          <Link href={getHref("/templates/classic#map")}>{t("directions")}</Link>
        </nav>

        <div className={styles.footerInfo}>
          <div>
            <h3>{t("address")}</h3>
            <p>{address}</p>
          </div>
          <div>
            <h3>{t("contact")}</h3>
            <p>TEL : {contact}</p>
            <p>FAX : {fax}</p>
          </div>
          <div>
            <h3>{t("email")}</h3>
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

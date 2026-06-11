"use client";

import Image from "next/image";
import TemplateGenerationActions from "./TemplateGenerationActions";
import {
  getDefaultStoreImage,
  type TemplateStore,
} from "@/lib/template-store-data";
import {
  EditorialFooter,
  EditorialHeader,
} from "./EditorialMarketStoresTemplate";
import styles from "./EditorialMarketTemplate.module.css";
import { useTemplateLanguage } from "./TemplateLanguageToggle";

const heroImage = "/images/templates/preview/editorial-store-hero.png";

interface EditorialMarketStoreDetailTemplateProps {
  store: TemplateStore;
  marketName?: string;
  address?: string;
  contact?: string;
  heroImageUrl?: string;
  previewMode?: boolean;
  publicBasePath?: string;
}

export default function EditorialMarketStoreDetailTemplate({
  store,
  marketName = "Market Name",
  address = "상세주소 text",
  contact = "TELEPHONENUM",
  heroImageUrl,
  previewMode = false,
  publicBasePath,
}: EditorialMarketStoreDetailTemplateProps) {
  const { t } = useTemplateLanguage();
  const representativeImageUrl =
    store.storeImageUrls[0] ??
    getDefaultStoreImage(store.category) ??
    heroImageUrl;
  const menuImageUrls = Array.from(
    new Set([...store.menuImageUrls, ...store.productImageUrls]),
  ).slice(0, 2);
  const signatureImageUrl = store.productImageUrls[0] ?? store.storeImageUrls[0];

  return (
    <main className={`${styles.page} ${styles.detailPage}`}>
      <EditorialHeader marketName={marketName} publicBasePath={publicBasePath} />

      <section className={styles.detailHero} aria-label="가게 상세">
        {representativeImageUrl ? (
          <span
            className={styles.dynamicHeroImage}
            style={{ backgroundImage: `url(${representativeImageUrl})` }}
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
        <div className={styles.detailHeroTitle}>
          <span>{store.category}</span>
          <h1>{store.name}</h1>
          <i />
        </div>
        <p>{store.intro}</p>
      </section>

      <section className={styles.menuSection} aria-label="메뉴">
        <h2>MENU</h2>
        <div
          className={`${styles.menuImages} ${
            menuImageUrls.length === 1 ? styles.singleMenuImage : ""
          }`}
        >
          {menuImageUrls.length > 0 ? (
            menuImageUrls.map((menuImageUrl, index) => (
              <span
                key={menuImageUrl}
                className={styles.dynamicMenuImage}
                style={{ backgroundImage: `url(${menuImageUrl})` }}
                aria-label={`메뉴판 이미지 ${index + 1}`}
              />
            ))
          ) : (
            <div className={styles.menuImagePlaceholder}>
              메뉴판 이미지 준비 중
            </div>
          )}
        </div>
      </section>

      <section className={styles.signatureSection} aria-label="대표 음식">
        <h2>{t("featuredFoodShort")}</h2>
        <div className={styles.signatureGrid}>
          <div
            className={styles.signaturePhoto}
            style={
              signatureImageUrl
                ? { backgroundImage: `url(${signatureImageUrl})` }
                : undefined
            }
          />
          <article>
            <h3>{store.menu}</h3>
            <p>{store.description}</p>
          </article>
        </div>
        <ul className={styles.storeInfoList}>
          <li>{t("businessHours")} : {store.hours}</li>
          <li>{t("storeContact")} : {store.phone}</li>
          <li>{t("storeLocation")} : (Google Maps)</li>
        </ul>
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

"use client";

import Image from "next/image";
import OpenStreetMapEmbed from "./OpenStreetMapEmbed";
import {
  EditorialFooter,
  EditorialHeaderWithBasePath,
} from "./EditorialMarketStoresTemplate";
import TemplateGenerationActions from "./TemplateGenerationActions";
import styles from "./EditorialMarketTemplate.module.css";

const heroImage = "/images/templates/preview/editorial-hero.png";
const foodImage = "/images/templates/preview/editorial-food.png";
const cultureImage = "/images/templates/preview/editorial-culture.png";
const routeImage = "/images/templates/preview/editorial-route.png";

export interface EditorialMarketTemplateData {
  marketName: string;
  intro: string;
  foodText: string;
  cultureText: string;
  address: string;
  contact: string;
}

const DEFAULT_DATA: EditorialMarketTemplateData = {
  marketName: "Market Name",
  intro:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
  foodText:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text.",
  cultureText:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text.",
  address: "서울특별시 중구 전통시장로 12",
  contact: "02-0000-0000",
};

interface EditorialMarketTemplateProps {
  data?: Partial<EditorialMarketTemplateData>;
  previewMode?: boolean;
  publicBasePath?: string;
}

export default function EditorialMarketTemplate({
  data,
  previewMode = false,
  publicBasePath,
}: EditorialMarketTemplateProps) {
  const content = { ...DEFAULT_DATA, ...data };

  return (
    <main className={styles.page}>
      <EditorialHeaderWithBasePath
        marketName={content.marketName}
        publicBasePath={publicBasePath}
      />

      <section className={styles.hero} id="intro" aria-label="시장 정보 안내">
        <Image
          alt=""
          className={styles.heroImage}
          fill
          priority
          sizes="100vw"
          src={heroImage}
        />
        <div className={styles.heroOverlay} />
        <p>{content.intro}</p>
      </section>

      <section className={styles.editorialSection} id="food" aria-label="점포 안내">
        <div className={styles.fullImageBlock}>
          <Image alt="" fill sizes="100vw" src={foodImage} />
          <div className={styles.tint} />
          <strong className={styles.foodWord}>FOOD</strong>
        </div>
        <p className={styles.wideText}>{content.foodText}</p>
      </section>

      <section className={styles.splitSection} id="culture" aria-label="관광 정보">
        <div className={styles.splitImage}>
          <Image alt="" fill sizes="(max-width: 900px) 100vw, 62vw" src={cultureImage} />
          <div className={styles.tint} />
        </div>
        <p>{content.cultureText}</p>
        <strong className={styles.cultureWord}>CULTURE</strong>
      </section>

      <section className={styles.routeBand} aria-hidden="true">
        <Image alt="" fill sizes="100vw" src={routeImage} />
        <div className={styles.tint} />
      </section>

      <section className={styles.mapSection} id="map" aria-label="찾아오시는 길">
        <h2>찾아오시는 길</h2>
        <div className={styles.mapBox}>
          <OpenStreetMapEmbed address={content.address} label={content.marketName} />
        </div>
      </section>

      <EditorialFooter
        address={content.address}
        contact={content.contact}
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

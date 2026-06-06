"use client";

import Image from "next/image";
import GoogleMapEmbed from "./GoogleMapEmbed";
import {
  EditorialFooter,
  EditorialHeaderWithBasePath,
} from "./EditorialMarketStoresTemplate";
import TemplateGenerationActions from "./TemplateGenerationActions";
import { useTemplateLanguage } from "./TemplateLanguageToggle";
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
  heroImageUrl?: string;
  logoImageUrl?: string;
  introImageUrls?: string[];
  directionsText?: string;
  routeText?: string;
  parkingText?: string;
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
  directionsText: "",
  routeText: "",
  parkingText: "",
};

function pickImage(
  urls: Array<string | undefined>,
  keywords: string[],
  fallbackIndex: number,
): string | undefined {
  const cleanUrls = urls.filter((url): url is string => Boolean(url?.trim()));
  const matched = cleanUrls.find((url) => {
    const lower = decodeURIComponent(url).toLowerCase();
    return keywords.some((keyword) => lower.includes(keyword));
  });

  return matched ?? cleanUrls[fallbackIndex] ?? cleanUrls[0];
}

function splitDirectionsText(text?: string) {
  const lines = text
    ?.split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean) ?? [];
  const route =
    lines.find((line) => /빨리|찾아|오시는|길|교통|버스|지하철|출구/.test(line)) ??
    lines[0] ??
    "";
  const parking = lines.find((line) => /주차|주차장|차량/.test(line)) ?? "";

  return { route, parking };
}

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
  const { t } = useTemplateLanguage();
  const content = { ...DEFAULT_DATA, ...data };
  const introImageUrls = content.introImageUrls ?? [];
  const imagePool = [content.heroImageUrl, ...introImageUrls];
  const heroImageUrl = pickImage(imagePool, ["topbanner", "top-banner", "hero", "main"], 0);
  const foodImageUrl = pickImage(imagePool, ["food", "먹거리"], 1);
  const cultureImageUrl = pickImage(imagePool, ["culture1", "culture", "관광"], 2);
  const routeImageUrl = pickImage(imagePool, ["culture2", "route", "map", "길"], 3);
  const directionParts = splitDirectionsText(content.directionsText);
  const routeText = content.routeText || directionParts.route;
  const parkingText = content.parkingText || directionParts.parking;

  return (
    <main className={styles.page}>
      <EditorialHeaderWithBasePath
        marketName={content.marketName}
        publicBasePath={publicBasePath}
      />

      <section className={styles.hero} id="intro" aria-label="시장 정보 안내">
        {heroImageUrl ? (
          <span
            className={styles.dynamicHeroImage}
            style={{ backgroundImage: `url(${heroImageUrl})` }}
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
        <p>{content.intro}</p>
      </section>

      <section className={styles.editorialSection} id="food" aria-label="점포 안내">
        <div className={styles.fullImageBlock}>
          {foodImageUrl ? (
            <span
              className={styles.dynamicBlockImage}
              style={{ backgroundImage: `url(${foodImageUrl})` }}
              aria-hidden="true"
            />
          ) : (
            <Image alt="" fill sizes="100vw" src={foodImage} />
          )}
          <div className={styles.tint} />
          <strong className={styles.foodWord}>FOOD</strong>
        </div>
        <p className={styles.wideText}>{content.foodText}</p>
      </section>

      <section className={styles.splitSection} id="culture" aria-label="관광 정보">
        <div className={styles.splitImage}>
          {cultureImageUrl ? (
            <span
              className={styles.dynamicBlockImage}
              style={{ backgroundImage: `url(${cultureImageUrl})` }}
              aria-hidden="true"
            />
          ) : (
            <Image alt="" fill sizes="(max-width: 900px) 100vw, 62vw" src={cultureImage} />
          )}
          <div className={styles.tint} />
        </div>
        <p>{content.cultureText}</p>
        <strong className={styles.cultureWord}>CULTURE</strong>
      </section>

      <section className={styles.routeBand} aria-hidden="true">
        {routeImageUrl ? (
          <span
            className={styles.dynamicBlockImage}
            style={{ backgroundImage: `url(${routeImageUrl})` }}
            aria-hidden="true"
          />
        ) : (
          <Image alt="" fill sizes="100vw" src={routeImage} />
        )}
        <div className={styles.tint} />
      </section>

      <section className={styles.mapSection} id="map" aria-label="찾아오시는 길">
        <h2>{t("directions")}</h2>
        <div className={styles.mapBox}>
          <GoogleMapEmbed address={content.address} label={content.marketName} />
        </div>
        {(routeText || parkingText) && (
          <dl className={styles.directionsInfo}>
            {routeText && (
              <div>
                <dt>{t("fastestRoute")} :</dt>
                <dd>{routeText}</dd>
              </div>
            )}
            {parkingText && (
              <div>
                <dt>{t("parking")} :</dt>
                <dd>{parkingText}</dd>
              </div>
            )}
          </dl>
        )}
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

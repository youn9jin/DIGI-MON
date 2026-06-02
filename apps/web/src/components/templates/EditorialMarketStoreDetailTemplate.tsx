"use client";

import Image from "next/image";
import TemplateGenerationActions from "./TemplateGenerationActions";
import type { ClassicStore } from "./classicStoreData";
import {
  EditorialFooter,
  EditorialHeader,
} from "./EditorialMarketStoresTemplate";
import styles from "./EditorialMarketTemplate.module.css";

const heroImage = "/images/templates/preview/editorial-store-detail-hero.png";
const menuImage1 = "/images/templates/preview/editorial-menu-1.png";
const menuImage2 = "/images/templates/preview/editorial-menu-2.png";

interface EditorialMarketStoreDetailTemplateProps {
  store: ClassicStore;
  marketName?: string;
  address?: string;
  contact?: string;
  previewMode?: boolean;
  publicBasePath?: string;
}

export default function EditorialMarketStoreDetailTemplate({
  store,
  marketName = "Market Name",
  address = "상세주소 text",
  contact = "TELEPHONENUM",
  previewMode = false,
  publicBasePath,
}: EditorialMarketStoreDetailTemplateProps) {
  return (
    <main className={`${styles.page} ${styles.detailPage}`}>
      <EditorialHeader marketName={marketName} publicBasePath={publicBasePath} />

      <section className={styles.detailHero} aria-label="가게 상세">
        <Image
          alt=""
          className={styles.heroImage}
          fill
          priority
          sizes="100vw"
          src={heroImage}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.detailHeroTitle}>
          <span>{store.category}</span>
          <h1>{store.name}</h1>
          <i />
        </div>
        <p>{store.intro}</p>
      </section>

      <div className={styles.detailActions}>
        <button type="button">수정</button>
        <button type="button">삭제</button>
      </div>

      <section className={styles.menuSection} aria-label="메뉴">
        <h2>MENU</h2>
        <div className={styles.menuImages}>
          <Image alt="메뉴판 예시 1" width={804} height={1058} src={menuImage1} />
          <Image alt="메뉴판 예시 2" width={804} height={1058} src={menuImage2} />
        </div>
      </section>

      <section className={styles.signatureSection} aria-label="대표 음식">
        <h2>대표 음식</h2>
        <div className={styles.signatureGrid}>
          <div className={styles.signaturePhoto} />
          <article>
            <h3>{store.menu} 이름</h3>
            <p>
              대통령은 헌법과 법률이 정하는 바에 의하여 공무원을 임면한다. 근로조건의
              기준은 인간의 존엄성을 보장하도록 법률로 정한다. 국무총리는 국회의 동의를
              얻어 대통령이 임명한다.
            </p>
          </article>
        </div>
        <ul className={styles.storeInfoList}>
          <li>영업 시간 : {store.hours}</li>
          <li>가게 연락처 : {store.phone}</li>
          <li>가게 위치 : (구글맵 링크)</li>
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

"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import styles from "./templates.module.css";

const classicBannerPieces = Array.from({ length: 18 }, (_, index) => index);

export default function TemplateSelectionPage() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.heading}>
          <div>
            <h1>웹사이트 템플릿을 선택해주세요</h1>
            <p>
              온보딩 정보와 AI 생성 콘텐츠가 들어갈 시장 웹사이트 디자인을 먼저 확인할 수 있어요.
            </p>
          </div>
        </div>

        <section className={styles.templateGrid} aria-label="웹사이트 템플릿 목록">
          <Link className={styles.templateCard} href="/templates/classic">
            <div className={`${styles.preview} ${styles.classicPreview}`}>
              <div className={styles.classicBanner}>
                {classicBannerPieces.map((piece) => (
                  <span key={piece} />
                ))}
              </div>
              <div className={styles.classicLogo} />
              <div className={styles.classicContent}>
                <div className={styles.classicPhoto} />
                <div className={styles.classicLines}>
                  <b />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
            <div className={styles.cardBody}>
              <h2>클래식 시장형</h2>
              <p>전통시장 배너와 큰 이미지 영역을 중심으로 시장 소개, 상점 정보, 길찾기를 차분하게 보여줍니다.</p>
              <span className={styles.badge}>미리보기 가능</span>
            </div>
          </Link>

          <Link className={styles.templateCard} href="/templates/modern">
            <div className={`${styles.preview} ${styles.modernDarkPreview}`}>
              <div className={styles.modernDarkNav} />
              <div className={styles.modernDarkHero}>
                <b />
                <span />
                <span />
              </div>
              <div className={styles.modernDarkPanel} />
            </div>
            <div className={styles.cardBody}>
              <h2>다크 모던형</h2>
              <p>차분한 다크 톤과 큰 타이포그래피로 시장의 브랜드감을 선명하게 보여줍니다.</p>
              <span className={styles.badge}>미리보기 가능</span>
            </div>
          </Link>

          <Link className={styles.templateCard} href="/templates/editorial">
            <div className={`${styles.preview} ${styles.editorialPreview}`}>
              <div className={styles.editorialNav} />
              <div className={styles.editorialHero} />
              <b>FOOD</b>
            </div>
            <div className={styles.cardBody}>
              <h2>에디토리얼형</h2>
              <p>큰 이미지와 잡지형 섹션 구성을 활용해 시장의 분위기와 먹거리, 관광 정보를 감각적으로 보여줍니다.</p>
              <span className={styles.badge}>미리보기 가능</span>
            </div>
          </Link>
        </section>
      </main>
    </div>
  );
}

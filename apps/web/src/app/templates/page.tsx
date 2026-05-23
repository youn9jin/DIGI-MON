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

          <div className={`${styles.templateCard} ${styles.disabled}`} aria-disabled="true">
            <div className={`${styles.preview} ${styles.warmPreview}`} />
            <div className={styles.cardBody}>
              <h2>따뜻한 홍보형</h2>
              <p>행사, 먹거리, 대표 상점을 더 적극적으로 드러내는 템플릿입니다.</p>
              <span className={styles.badge}>준비 중</span>
            </div>
          </div>

          <div className={`${styles.templateCard} ${styles.disabled}`} aria-disabled="true">
            <div className={`${styles.preview} ${styles.modernPreview}`} />
            <div className={styles.cardBody}>
              <h2>모던 안내형</h2>
              <p>지도, 운영시간, 카테고리 탐색을 빠르게 확인하는 정보형 템플릿입니다.</p>
              <span className={styles.badge}>준비 중</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

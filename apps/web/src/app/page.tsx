"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getMe, getWebsiteEntryPath } from "@/lib/api/me";
import Header from "@/components/layout/Header";
import styles from "./landing.module.css";

export default function LandingPage() {
  const [ctaHref, setCtaHref] = useState<string>("/intro");
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [hasWebsite, setHasWebsite] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCtaHref("/intro");
        setHasWebsite(false);
        setIsAuthReady(true);
        return;
      }

      try {
        const me = await getMe(user);
        const entryPath = await getWebsiteEntryPath(me);
        setCtaHref(entryPath);
        setHasWebsite(entryPath === "/dashboard");
      } catch {
        setCtaHref("/onboarding");
        setHasWebsite(false);
      } finally {
        setIsAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className={styles.viewport}>
      <section className={styles.canvas}>
        <Header />

        {/* 배경 일러스트 — full opacity, 모바일에서도 유지 */}
        <div className={styles.illustrationLanding} aria-hidden="true">
          <Image
            src="/images/onboarding/market-illustration.png"
            alt=""
            width={1550}
            height={1550}
            priority
            className={styles.illustrationImageFull}
          />
        </div>

        {/* CTA 버튼 */}
        {isAuthReady && (
          <Link href={ctaHref} className={styles.heroCtaButton}>
            {hasWebsite
              ? "우리 시장 맞춤 웹사이트 관리하러 가기"
              : "우리 시장 맞춤 웹사이트 만들러 가기"}
          </Link>
        )}

        {/* 하단 chevron */}
        <a
          className={styles.scrollArrow}
          href="#withon-guide"
          aria-label="WithOn 사용 방법 보기"
        >
          <svg
            viewBox="0 0 50 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 4L25 24L46 4"
              stroke="#103567"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </section>

      <section className={styles.guideSection} id="withon-guide">
        <div className={styles.guideInner}>
          <div className={styles.introRows}>
            <article className={styles.introRow}>
              <div className={styles.introCopy}>
                <h2>
                  지금까지 시장 블로그, 카페, 웹사이트 관리하느라 지친
                  <br />
                  상인회 관리자를 위한 서비스
                </h2>
                <p>
                  위치, 영업시간, 가게 정보 등 시장 상세 정보를 입력하기만 하면
                  자동으로 생성되는 웹사이트 서비스 “WithOn”
                </p>
              </div>
              <Image
                className={styles.introScreenshot}
                src="/images/landing/overview.jpg"
                alt="WithOn 메인 화면 예시"
                width={1920}
                height={1080}
              />
            </article>

            <article className={styles.introRow}>
              <div className={styles.introCopy}>
                <h2>웹사이트 생성, 관리, 수정까지 한 번에!</h2>
                <p>
                  새로운 가게가 입점하고, 자리하던 가게가 나갈 때 수정하느라
                  번거로웠던 과거는 이제 안녕! WithOn 웹사이트에서 웹사이트 생성,
                  관리, 수정까지 한 번에 작업하세요.
                </p>
              </div>
              <Image
                className={styles.introScreenshot}
                src="/images/landing/manage.jpg"
                alt="WithOn 웹사이트 관리 화면 예시"
                width={1920}
                height={1080}
              />
            </article>
          </div>

          <header className={styles.guideHeader}>
            <h2>WithOn 서비스를 가장 쉽게 사용하는 방법</h2>
            <p>복잡한 웹사이트 사용 방법을 한 번에 알려드릴게요</p>
          </header>

          <article className={styles.guideStep}>
            <h3>1. 회원가입 하기</h3>
            <p>계정 생성을 위해서 먼저 회원 가입이 필요해요. 1분이면 끝나요.</p>
            <div className={styles.threeShotGrid}>
              {[
                ["signup-start.jpg", "회원가입 시작 화면"],
                ["signup-form.jpg", "회원가입 정보 입력 화면"],
                ["signup-complete.jpg", "회원가입 완료 화면"],
              ].map(([src, alt]) => (
                <Image
                  key={src}
                  src={`/images/landing/${src}`}
                  alt={alt}
                  width={1920}
                  height={1080}
                />
              ))}
            </div>
          </article>

          <article className={styles.guideStep}>
            <h3>2. 시장 기본 정보 입력하기</h3>
            <p>
              우리 시장 맞춤형 웹사이트 제작을 위해서 시장과 관련된 10개의 정보가
              필요해요.
              <br />
              5분 미만으로 소요되는 간단한 질문들이에요.
            </p>
            <div className={styles.threeShotGrid}>
              {[
                ["onboarding-start.jpg", "시장 기본 정보 입력 시작 화면"],
                ["onboarding-info.jpg", "시장 정보 입력 화면"],
                ["onboarding-hours.jpg", "시장 운영 시간 입력 화면"],
              ].map(([src, alt]) => (
                <Image
                  key={src}
                  src={`/images/landing/${src}`}
                  alt={alt}
                  width={1920}
                  height={1080}
                />
              ))}
            </div>
          </article>

          <article className={styles.guideStep}>
            <h3>3. 시장 소개 문구, 가게 정보 입력하고 웹사이트 생성하기</h3>
            <p>
              웹사이트에 들어갈 상세 문구와 가게 정보가 필요해요. 담당자님이 필요한
              정보를 편하게 작성해주시면, AI를 활용해 실제로 작성할 수 있는 문구로
              생성해드려요.
              <br />
              가게 정보는 엑셀 파일을 활용해 간단하게 입력한 뒤 웹사이트 생성 버튼을
              눌러주세요.
            </p>
            <div className={styles.twoShotGrid}>
              <Image
                src="/images/landing/generate-template.jpg"
                alt="웹사이트 디자인 선택 화면"
                width={982}
                height={674}
              />
              <Image
                src="/images/landing/generate-info.jpg"
                alt="웹사이트 상세 정보 입력 화면"
                width={1152}
                height={990}
              />
            </div>
          </article>

          <article className={styles.guideStep}>
            <h3>4. 웹사이트 관리하기</h3>
            <p>
              웹사이트 관리를 별도의 공부 없이 WithOn 사이트에서 바로 할 수 있어요.
              처음 선택한 템플릿이 마음에 들지 않거나, 언제든지 웹사이트 관리
              페이지에 들어가 다른 템플릿으로 바꿀 수 있어요.
              <br />
              시장 정보와 가게 정보도 관리 화면에서 바로 수정할 수 있습니다.
            </p>
            <div className={styles.threeShotGrid}>
              <Image
                src="/images/landing/manage.jpg"
                alt="웹사이트 관리 시작 화면"
                width={1920}
                height={1080}
              />
              <Image
                src="/images/landing/edit-info.jpg"
                alt="웹사이트 상세 정보 수정 화면"
                width={1920}
                height={1502}
              />
              <Image
                src="/images/landing/change-template.jpg"
                alt="웹사이트 템플릿 교체 화면"
                width={1920}
                height={1184}
              />
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

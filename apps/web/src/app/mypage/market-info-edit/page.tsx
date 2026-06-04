"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Header from "@/components/layout/Header";
import {
  getPublicMarketPageContent,
  type MarketPageContentResponse,
} from "@/lib/api/market-page";
import { getMe, type MeResponse } from "@/lib/api/me";
import { auth } from "@/lib/firebase";
import styles from "../mypage.module.css";

const marketTypes = ["전통시장", "상점가", "복합시장"] as const;
const storeRanges = [
  "10개 이상 20개 미만",
  "20개 이상 30개 미만",
  "30개 이상 40개 미만",
  "40개 이상 50개 미만",
  "50개 이상",
] as const;

type FormState = {
  marketName: string;
  roadAddress: string;
  detailAddress: string;
  marketType: string;
  storeRange: string;
  weekdayHours: string;
  weekendHours: string;
  sundayClosed: boolean;
  mainVisitors: string;
  contact: string;
};

function createInitialForm(
  me: MeResponse | null,
  content: MarketPageContentResponse | null,
): FormState {
  const address = content?.address ?? me?.address ?? "";
  const storeCount = content?.stores?.length ?? 0;

  return {
    marketName: content?.marketName ?? me?.marketName ?? "",
    roadAddress: address,
    detailAddress: "",
    marketType: "전통시장",
    storeRange:
      storeCount >= 50
        ? "50개 이상"
        : storeCount >= 40
          ? "40개 이상 50개 미만"
          : storeCount >= 30
            ? "30개 이상 40개 미만"
            : storeCount >= 20
              ? "20개 이상 30개 미만"
              : "10개 이상 20개 미만",
    weekdayHours: "",
    weekendHours: "",
    sundayClosed: false,
    mainVisitors: "",
    contact: content?.contact ?? me?.phone ?? "",
  };
}

export default function MarketInfoEditPage() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [form, setForm] = useState<FormState>(() => createInitialForm(null, null));
  const [isLoading, setIsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
        return;
      }

      try {
        const nextMe = await getMe(currentUser);
        let nextContent: MarketPageContentResponse | null = null;

        if (nextMe.marketId) {
          try {
            nextContent = await getPublicMarketPageContent(nextMe.marketId);
          } catch {
            nextContent = null;
          }
        }

        setMe(nextMe);
        setForm(createInitialForm(nextMe, nextContent));
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const websiteHref = useMemo(() => {
    return me?.marketId ? `/markets/${me.marketId}` : "/templates";
  }, [me?.marketId]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveMessage("시장 기본 정보 수정 API가 준비되면 이 값으로 저장됩니다.");
  }

  if (isLoading) {
    return (
      <main className={styles.page}>
        <Header variant="builder" />
        <div className={styles.loading}>불러오는 중...</div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Header variant="builder" />

      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="마이페이지 메뉴">
          <Link className={styles.sidebarButton} href="/mypage">
            전체 보기
          </Link>
          <Link className={`${styles.sidebarButton} ${styles.active}`} href="/mypage">
            내 정보
          </Link>
          <Link className={styles.sidebarButton} href={websiteHref}>
            웹사이트 확인
          </Link>
          <button className={`${styles.sidebarButton} ${styles.logout}`} onClick={handleLogout}>
            로그아웃
          </button>
        </aside>

        <section className={styles.content} aria-labelledby="market-edit-title">
          <h1 className={styles.pageTitle}>마이페이지</h1>

          <section className={styles.editIntro}>
            <h2 id="market-edit-title">시장 정보 수정하기</h2>
            <p>온보딩에서 입력한 시장 정보를 수정할 수 있어요</p>
          </section>

          <form className={styles.editPanel} onSubmit={handleSubmit}>
            <label className={styles.fieldGroup}>
              <span>1. 시장 이름 수정하기</span>
              <input
                value={form.marketName}
                onChange={(event) => updateField("marketName", event.target.value)}
                placeholder="(기존 시장 이름)"
              />
            </label>

            <fieldset className={styles.fieldGroup}>
              <legend>2. 시장 상세 주소 수정하기</legend>
              <label>
                <span>도로명 주소</span>
                <input
                  value={form.roadAddress}
                  onChange={(event) => updateField("roadAddress", event.target.value)}
                  placeholder="(기존 도로명 주소)"
                />
              </label>
              <label>
                <span>상세 주소</span>
                <input
                  value={form.detailAddress}
                  onChange={(event) => updateField("detailAddress", event.target.value)}
                  placeholder="(기존 상세 주소)"
                />
              </label>
            </fieldset>

            <fieldset className={styles.choiceGroup}>
              <legend>3. 시장 유형 수정하기</legend>
              <div className={styles.choiceGrid}>
                {marketTypes.map((type) => (
                  <label className={styles.choiceBox} key={type}>
                    <input
                      type="radio"
                      name="marketType"
                      checked={form.marketType === type}
                      onChange={() => updateField("marketType", type)}
                    />
                    <span aria-hidden="true" />
                    {type}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className={styles.choiceGroup}>
              <legend>4. 시장 총 점포 수 수정하기</legend>
              <div className={`${styles.choiceGrid} ${styles.storeRangeGrid}`}>
                {storeRanges.map((range) => (
                  <label className={styles.choiceBox} key={range}>
                    <input
                      type="radio"
                      name="storeRange"
                      checked={form.storeRange === range}
                      onChange={() => updateField("storeRange", range)}
                    />
                    <span aria-hidden="true" />
                    {range}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className={styles.fieldGroup}>
              <legend>5. 시장 운영 시간 수정하기</legend>
              <label>
                <span>평일</span>
                <input
                  value={form.weekdayHours}
                  onChange={(event) => updateField("weekdayHours", event.target.value)}
                  placeholder="예) 09:00 - 20:00"
                />
              </label>
              <label>
                <span>주말</span>
                <input
                  value={form.weekendHours}
                  onChange={(event) => updateField("weekendHours", event.target.value)}
                  placeholder="예) 10:00 - 18:00"
                />
              </label>
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={form.sundayClosed}
                  onChange={(event) => updateField("sundayClosed", event.target.checked)}
                />
                <span>일요일 휴무</span>
              </label>
            </fieldset>

            <label className={styles.fieldGroup}>
              <span>6. 시장 주 방문층 수정하기</span>
              <textarea
                value={form.mainVisitors}
                onChange={(event) => updateField("mainVisitors", event.target.value)}
                placeholder="(기존 응답)"
              />
            </label>

            <label className={styles.fieldGroup}>
              <span>7. 시장 대표 연락처 수정하기(선택)</span>
              <input
                value={form.contact}
                onChange={(event) => updateField("contact", event.target.value)}
                placeholder="(기존 응답 - 있는 경우)"
              />
            </label>

            {saveMessage && <p className={styles.saveMessage}>{saveMessage}</p>}

            <button className={styles.saveButton} type="submit">
              저장하기
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

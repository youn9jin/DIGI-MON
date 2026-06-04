"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Header from "@/components/layout/Header";
import DeleteAccountModal from "@/components/ui/DeleteAccountModal";
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
  const [scale, setScale] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    function updateScale() {
      setScale(Math.min(1, window.innerWidth / 1920));
    }

    updateScale();
    window.addEventListener("resize", updateScale);

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

    return () => {
      unsubscribe();
      window.removeEventListener("resize", updateScale);
    };
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

  function handleDeleteAccountConfirm() {
    setIsDeleteModalOpen(false);
    setSaveMessage("회원 탈퇴 API가 준비되면 이 버튼에 연결됩니다.");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveMessage("시장 기본 정보 수정 API가 준비되면 이 값으로 저장됩니다.");
  }

  const canvasStyle = { "--mypage-edit-scale": scale } as CSSProperties;

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

      <div className={styles.editFigmaViewport} style={canvasStyle}>
        <form className={styles.editFigmaCanvas} onSubmit={handleSubmit}>
          <h1 className={styles.editFigmaPageTitle}>마이페이지</h1>

          <aside className={styles.figmaSidebar} aria-label="마이페이지 메뉴">
            <Link className={styles.figmaSideButton} href="/mypage">
              전체 보기
            </Link>
            <Link className={`${styles.figmaSideButton} ${styles.figmaSideActive}`} href="/mypage">
              내 정보
            </Link>
            <Link className={styles.figmaSideButton} href={websiteHref}>
              웹사이트 확인
            </Link>
            <button
              className={`${styles.figmaSideButton} ${styles.figmaLogout}`}
              type="button"
              onClick={handleLogout}
            >
              로그아웃
            </button>
            <button
              className={`${styles.figmaSideButton} ${styles.figmaWithdraw}`}
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              회원 탈퇴
            </button>
          </aside>

          <h2 className={styles.editFigmaTitle}>시장 정보 수정하기</h2>
          <p className={styles.editFigmaDescription}>온보딩에서 입력한 시장 정보를 수정할 수 있어요</p>
          <div className={styles.editFigmaPanel} aria-hidden="true" />

          <label className={styles.editFigmaLabel} style={{ left: 508, top: 390 }}>
            1. 시장 이름
          </label>
          <input
            className={styles.editFigmaInput}
            style={{ left: 505, top: 433 }}
            value={form.marketName}
            onChange={(event) => updateField("marketName", event.target.value)}
            placeholder="(기존 시장 이름)"
          />

          <div className={styles.editFigmaLabel} style={{ left: 508, top: 572 }}>
            2. 시장 상세 주소
          </div>
          <label className={styles.editFigmaSubLabel} style={{ left: 515, top: 615 }}>
            도로명 주소
          </label>
          <input
            className={styles.editFigmaInput}
            style={{ left: 505, top: 647 }}
            value={form.roadAddress}
            onChange={(event) => updateField("roadAddress", event.target.value)}
            placeholder="(기존 도로명 주소)"
          />
          <label className={styles.editFigmaSubLabel} style={{ left: 515, top: 741 }}>
            상세 주소
          </label>
          <input
            className={styles.editFigmaInput}
            style={{ left: 505, top: 772 }}
            value={form.detailAddress}
            onChange={(event) => updateField("detailAddress", event.target.value)}
            placeholder="(기존 상세 주소)"
          />

          <div className={styles.editFigmaLabel} style={{ left: 508, top: 911 }}>
            3. 시장 유형
          </div>
          {marketTypes.map((type, index) => (
            <label
              className={styles.editFigmaChoice}
              key={type}
              style={{ left: 505, top: 954 + index * 94, width: 1155 }}
            >
              <input
                type="radio"
                name="marketType"
                checked={form.marketType === type}
                onChange={() => updateField("marketType", type)}
              />
              <span
                className={`${styles.editFigmaDot} ${
                  form.marketType === type ? styles.editFigmaDotSelected : ""
                }`}
                aria-hidden="true"
              />
              {type}
            </label>
          ))}

          <div className={styles.editFigmaLabel} style={{ left: 515, top: 1286 }}>
            4. 시장 총 점포 수
          </div>
          {storeRanges.map((range, index) => (
            <label
              className={styles.editFigmaChoice}
              key={range}
              style={{ left: index === 0 ? 508 : 505, top: 1324 + index * 102, width: 1193 }}
            >
              <input
                type="radio"
                name="storeRange"
                checked={form.storeRange === range}
                onChange={() => updateField("storeRange", range)}
              />
              <span
                className={`${styles.editFigmaDot} ${
                  form.storeRange === range ? styles.editFigmaDotSelected : ""
                }`}
                aria-hidden="true"
              />
              {range}
            </label>
          ))}

          <div className={styles.editFigmaLabel} style={{ left: 515, top: 1877 }}>
            5. 시장 운영 시간
          </div>
          <div className={styles.editFigmaTimeTitle} style={{ left: 505, top: 1920 }}>
            평일(월 ~ 금)
          </div>
          <input
            className={styles.editFigmaTimeInput}
            style={{ left: 518, top: 1973 }}
            value={form.weekdayHours}
            onChange={(event) => updateField("weekdayHours", event.target.value)}
            placeholder="(입력된 운영 시간)"
          />
          <span className={styles.editFigmaTimeText} style={{ left: 733, top: 1982 }}>
            시
          </span>
          <input className={styles.editFigmaTimeInput} style={{ left: 767, top: 1973 }} />
          <span className={styles.editFigmaTimeText} style={{ left: 982, top: 1982 }}>
            분
          </span>
          <span className={styles.editFigmaTimeText} style={{ left: 1016, top: 1982 }}>
            부터
          </span>
          <input className={styles.editFigmaTimeInput} style={{ left: 1074, top: 1973 }} />
          <span className={styles.editFigmaTimeText} style={{ left: 1289, top: 1982 }}>
            시
          </span>
          <input className={styles.editFigmaTimeInput} style={{ left: 1323, top: 1973 }} />
          <span className={styles.editFigmaTimeText} style={{ left: 1538, top: 1982 }}>
            분
          </span>
          <span className={styles.editFigmaTimeText} style={{ left: 1578, top: 1982 }}>
            까지
          </span>

          <div className={styles.editFigmaTimeTitle} style={{ left: 505, top: 2062 }}>
            주말(토 ~ 일)
          </div>
          <input
            className={styles.editFigmaTimeInput}
            style={{ left: 518, top: 2118 }}
            value={form.weekendHours}
            onChange={(event) => updateField("weekendHours", event.target.value)}
          />
          <span className={styles.editFigmaTimeText} style={{ left: 733, top: 2127 }}>
            시
          </span>
          <input className={styles.editFigmaTimeInput} style={{ left: 767, top: 2118 }} />
          <span className={styles.editFigmaTimeText} style={{ left: 982, top: 2127 }}>
            분
          </span>
          <span className={styles.editFigmaTimeText} style={{ left: 1016, top: 2127 }}>
            부터
          </span>
          <input className={styles.editFigmaTimeInput} style={{ left: 1074, top: 2118 }} />
          <span className={styles.editFigmaTimeText} style={{ left: 1289, top: 2127 }}>
            시
          </span>
          <input className={styles.editFigmaTimeInput} style={{ left: 1323, top: 2118 }} />
          <span className={styles.editFigmaTimeText} style={{ left: 1538, top: 2127 }}>
            분
          </span>
          <span className={styles.editFigmaTimeText} style={{ left: 1578, top: 2127 }}>
            까지
          </span>
          <label className={styles.editFigmaCheckbox} style={{ left: 505, top: 2211 }}>
            <input
              type="checkbox"
              checked={form.sundayClosed}
              onChange={(event) => updateField("sundayClosed", event.target.checked)}
            />
            <span>일요일에는 시장을 운영하지 않습니다.</span>
          </label>

          <label className={styles.editFigmaLabel} style={{ left: 515, top: 2288 }}>
            6. 시장 주 방문층
          </label>
          <textarea
            className={`${styles.editFigmaInput} ${styles.editFigmaTextarea}`}
            style={{ left: 508, top: 2331 }}
            value={form.mainVisitors}
            onChange={(event) => updateField("mainVisitors", event.target.value)}
            placeholder="(기존 응답)"
          />

          <label className={styles.editFigmaLabel} style={{ left: 518, top: 2573 }}>
            7. 시장 대표 연락처 <span>(선택)</span>
          </label>
          <input
            className={styles.editFigmaInput}
            style={{ left: 508, top: 2626 }}
            value={form.contact}
            onChange={(event) => updateField("contact", event.target.value)}
            placeholder="(기존 응답 - 있는 경우)"
          />

          {saveMessage && <p className={styles.editFigmaSaveMessage}>{saveMessage}</p>}
          <button className={styles.editFigmaSaveButton} type="submit">
            저장하기
          </button>
        </form>
      </div>
      {isDeleteModalOpen && (
        <DeleteAccountModal
          onConfirm={handleDeleteAccountConfirm}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}
    </main>
  );
}

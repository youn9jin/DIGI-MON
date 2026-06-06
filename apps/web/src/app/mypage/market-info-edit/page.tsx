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
  type UpdateMarketInfoRequest,
  updateMarketInfo,
} from "@/lib/api/market-page";
import {
  deleteMe,
  getMe,
  getMyPage,
  type MeResponse,
  type MyPageResponse,
} from "@/lib/api/me";
import { auth } from "@/lib/firebase";
import {
  joinTimeRange,
  parseOperatingHours,
  splitMarketAddress,
  splitTimeRange,
} from "@/lib/market-info";
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
  weekdayOpenHour: string;
  weekdayOpenMinute: string;
  weekdayCloseHour: string;
  weekdayCloseMinute: string;
  weekendOpenHour: string;
  weekendOpenMinute: string;
  weekendCloseHour: string;
  weekendCloseMinute: string;
  sundayClosed: boolean;
  mainVisitors: string;
  contact: string;
};

function getStoreRange(storeCount: number): string {
  if (storeCount >= 50) return "50개 이상";
  if (storeCount >= 40) return "40개 이상 50개 미만";
  if (storeCount >= 30) return "30개 이상 40개 미만";
  if (storeCount >= 20) return "20개 이상 30개 미만";
  return "10개 이상 20개 미만";
}

function createInitialForm(
  me: MeResponse | null,
  content: MarketPageContentResponse | null,
  myPage: MyPageResponse | null,
): FormState {
  const address = content?.address ?? myPage?.market?.address ?? me?.address ?? "";
  const { roadAddress, detailAddress } = splitMarketAddress(address);
  const operatingHours = parseOperatingHours(myPage?.market?.operatingHours);
  const weekday = splitTimeRange(operatingHours.weekday);
  const weekend = splitTimeRange(operatingHours.weekend);
  const storeCount = myPage?.storeCount ?? content?.stores?.length ?? 0;
  const savedStoreRange =
    typeof myPage?.market?.totalStores === "string" &&
    storeRanges.includes(myPage.market.totalStores as (typeof storeRanges)[number])
      ? myPage.market.totalStores
      : getStoreRange(
          typeof myPage?.market?.totalStores === "number"
            ? myPage.market.totalStores
            : storeCount,
        );

  return {
    marketName: content?.marketName ?? myPage?.market?.name ?? me?.marketName ?? "",
    roadAddress,
    detailAddress,
    marketType: myPage?.market?.marketType ?? "전통시장",
    storeRange: savedStoreRange,
    weekdayOpenHour: weekday.openHour,
    weekdayOpenMinute: weekday.openMinute,
    weekdayCloseHour: weekday.closeHour,
    weekdayCloseMinute: weekday.closeMinute,
    weekendOpenHour: weekend.openHour,
    weekendOpenMinute: weekend.openMinute,
    weekendCloseHour: weekend.closeHour,
    weekendCloseMinute: weekend.closeMinute,
    sundayClosed: Boolean(operatingHours.weekday && !operatingHours.weekend),
    mainVisitors: myPage?.market?.targetCustomers ?? "",
    contact: content?.contact ?? myPage?.market?.contact ?? me?.phone ?? "",
  };
}

export default function MarketInfoEditPage() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [form, setForm] = useState<FormState>(() => createInitialForm(null, null, null));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
        const [nextMe, nextMyPage] = await Promise.all([
          getMe(currentUser),
          getMyPage(currentUser).catch(() => null),
        ]);
        let nextContent: MarketPageContentResponse | null = null;

        if (nextMe.marketId) {
          try {
            nextContent = await getPublicMarketPageContent(nextMe.marketId);
          } catch {
            nextContent = null;
          }
        }

        setMe(nextMe);
        setForm(createInitialForm(nextMe, nextContent, nextMyPage));
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

  function updateTimeField(
    key:
      | "weekdayOpenHour"
      | "weekdayOpenMinute"
      | "weekdayCloseHour"
      | "weekdayCloseMinute"
      | "weekendOpenHour"
      | "weekendOpenMinute"
      | "weekendCloseHour"
      | "weekendCloseMinute",
    value: string,
  ) {
    updateField(key, value.replace(/\D/g, "").slice(0, 2));
  }

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  async function handleDeleteAccountConfirm() {
    setSaveMessage("");

    try {
      await deleteMe();
      setIsDeleteModalOpen(false);
      await signOut(auth).catch(() => undefined);
      router.replace("/login");
    } catch (error) {
      setIsDeleteModalOpen(false);
      setSaveMessage(error instanceof Error ? error.message : "회원 탈퇴에 실패했습니다.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveMessage("");

    const contact = form.contact.trim();
    if (contact && !/^[0-9+\-()\s]{5,20}$/.test(contact)) {
      setSaveMessage("연락처는 숫자, +, -, (, ), 공백으로 구성된 5~20자여야 합니다.");
      return;
    }

    const address = [form.roadAddress.trim(), form.detailAddress.trim()]
      .filter(Boolean)
      .join(" ");
    const weekdayHours = joinTimeRange({
      openHour: form.weekdayOpenHour,
      openMinute: form.weekdayOpenMinute,
      closeHour: form.weekdayCloseHour,
      closeMinute: form.weekdayCloseMinute,
    });
    const weekendHours = form.sundayClosed
      ? null
      : joinTimeRange({
          openHour: form.weekendOpenHour,
          openMinute: form.weekendOpenMinute,
          closeHour: form.weekendCloseHour,
          closeMinute: form.weekendCloseMinute,
        });

    if (!weekdayHours) {
      setSaveMessage("평일 운영 시간을 모두 입력해주세요.");
      return;
    }

    if (!form.sundayClosed && !weekendHours) {
      setSaveMessage("주말 운영 시간을 모두 입력하거나 일요일 휴무를 선택해주세요.");
      return;
    }

    const payload: UpdateMarketInfoRequest = {
      name: form.marketName.trim() || null,
      address: address || null,
      marketType: form.marketType || null,
      totalStores: form.storeRange || null,
      operatingHours: {
        weekday: weekdayHours,
        weekend: weekendHours,
      },
      targetCustomers: form.mainVisitors.trim() || null,
      contact: contact || null,
    };

    setIsSaving(true);

    try {
      await updateMarketInfo(payload);
      setSaveMessage("시장 정보를 수정했어요.");
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "시장 정보 수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
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
            value={form.weekdayOpenHour}
            onChange={(event) => updateTimeField("weekdayOpenHour", event.target.value)}
            placeholder="09"
            inputMode="numeric"
            maxLength={2}
          />
          <span className={styles.editFigmaTimeText} style={{ left: 733, top: 1982 }}>
            시
          </span>
          <input
            className={styles.editFigmaTimeInput}
            style={{ left: 767, top: 1973 }}
            value={form.weekdayOpenMinute}
            onChange={(event) => updateTimeField("weekdayOpenMinute", event.target.value)}
            placeholder="00"
            inputMode="numeric"
            maxLength={2}
          />
          <span className={styles.editFigmaTimeText} style={{ left: 982, top: 1982 }}>
            분
          </span>
          <span className={styles.editFigmaTimeText} style={{ left: 1016, top: 1982 }}>
            부터
          </span>
          <input
            className={styles.editFigmaTimeInput}
            style={{ left: 1074, top: 1973 }}
            value={form.weekdayCloseHour}
            onChange={(event) => updateTimeField("weekdayCloseHour", event.target.value)}
            placeholder="18"
            inputMode="numeric"
            maxLength={2}
          />
          <span className={styles.editFigmaTimeText} style={{ left: 1289, top: 1982 }}>
            시
          </span>
          <input
            className={styles.editFigmaTimeInput}
            style={{ left: 1323, top: 1973 }}
            value={form.weekdayCloseMinute}
            onChange={(event) => updateTimeField("weekdayCloseMinute", event.target.value)}
            placeholder="00"
            inputMode="numeric"
            maxLength={2}
          />
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
            value={form.weekendOpenHour}
            onChange={(event) => updateTimeField("weekendOpenHour", event.target.value)}
            placeholder="09"
            inputMode="numeric"
            maxLength={2}
            disabled={form.sundayClosed}
          />
          <span className={styles.editFigmaTimeText} style={{ left: 733, top: 2127 }}>
            시
          </span>
          <input
            className={styles.editFigmaTimeInput}
            style={{ left: 767, top: 2118 }}
            value={form.weekendOpenMinute}
            onChange={(event) => updateTimeField("weekendOpenMinute", event.target.value)}
            placeholder="00"
            inputMode="numeric"
            maxLength={2}
            disabled={form.sundayClosed}
          />
          <span className={styles.editFigmaTimeText} style={{ left: 982, top: 2127 }}>
            분
          </span>
          <span className={styles.editFigmaTimeText} style={{ left: 1016, top: 2127 }}>
            부터
          </span>
          <input
            className={styles.editFigmaTimeInput}
            style={{ left: 1074, top: 2118 }}
            value={form.weekendCloseHour}
            onChange={(event) => updateTimeField("weekendCloseHour", event.target.value)}
            placeholder="18"
            inputMode="numeric"
            maxLength={2}
            disabled={form.sundayClosed}
          />
          <span className={styles.editFigmaTimeText} style={{ left: 1289, top: 2127 }}>
            시
          </span>
          <input
            className={styles.editFigmaTimeInput}
            style={{ left: 1323, top: 2118 }}
            value={form.weekendCloseMinute}
            onChange={(event) => updateTimeField("weekendCloseMinute", event.target.value)}
            placeholder="00"
            inputMode="numeric"
            maxLength={2}
            disabled={form.sundayClosed}
          />
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
          <button className={styles.editFigmaSaveButton} type="submit" disabled={isSaving}>
            {isSaving ? "저장 중" : "저장하기"}
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

import { auth } from "@/lib/firebase";
import { getOnboardingData, clearOnboardingData } from "@/lib/onboarding-store";

// ── 프론트 레이블 → API enum 매핑 ──────────────────────────────

const MARKET_TYPE_MAP: Record<string, string> = {
  "전통시장": "TRADITIONAL",
  "상점가": "COMMERCIAL",
  "복합시장": "COMPLEX",
};

// 주의: 프론트 5단계 → API 4단계로 그루핑
const STORE_COUNT_MAP: Record<string, string> = {
  "10개 이상 20개 미만": "TEN_TO_30",
  "20개 이상 30개 미만": "TEN_TO_30",
  "30개 이상 40개 미만": "THIRTY_TO_50",
  "40개 이상 50개 미만": "THIRTY_TO_50",
  "50개 이상": "OVER_50",
};

const CATEGORY_MAP: Record<string, string> = {
  "농/수산물": "농수산물",
  "음식점": "먹거리",
  "의류": "의류",
  "생활용품": "생활용품",
  "기타": "기타",
};

// ── 응답 타입 ───────────────────────────────────────────────────

export interface OnboardingResponse {
  marketId: number;
  name: string;
  message: string;
}

export interface OnboardingError {
  status: number;
  code?: string;
  message?: string;
}

// ── API 호출 ───────────────────────────────────────────────────

export async function submitOnboarding(): Promise<OnboardingResponse> {
  const user = auth.currentUser;
  if (!user) {
    throw { status: 401, code: "UNAUTHORIZED", message: "로그인이 필요합니다." } as OnboardingError;
  }

  const idToken = await user.getIdToken();
  const data = getOnboardingData();

  const address = [data.address, data.detailAddress].filter(Boolean).join(" ");

  const payload = {
    name: data.marketName,
    address,
    marketType: MARKET_TYPE_MAP[data.marketType ?? ""],
    mainCategories: (data.mainCategories ?? []).map((c) => CATEGORY_MAP[c] ?? c),
    totalStores: STORE_COUNT_MAP[data.totalStores ?? ""],
    operatingHours: {
      weekday: `${data.weekdayOpen}~${data.weekdayClose}`,
      weekend: data.closedSunday
        ? null
        : `${data.weekendOpen}~${data.weekendClose}`,
    },
    targetCustomers: data.targetCustomers,
    ...(data.contactNumber ? { contact: data.contactNumber } : {}),
    ...(data.introduction ? { description: data.introduction } : {}),
    ...(data.managerName ? { managerName: data.managerName } : {}),
    ...(data.managerRole ? { managerTitle: data.managerRole } : {}),
  };

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const response = await fetch(`${baseUrl}/api/associations/onboarding`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw { status: response.status, ...errorBody } as OnboardingError;
  }

  const result: OnboardingResponse = await response.json();
  clearOnboardingData();
  return result;
}

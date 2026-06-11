import type { User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getPublicMarketPageContent } from "@/lib/api/market-page";

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  error?: {
    message?: string;
  };
}

export interface MeResponse {
  id?: number | string;
  uid?: string;
  email?: string;
  name?: string;
  phone?: string;
  role?: string;
  marketId?: number | string;
  marketName?: string;
  address?: string;
  missing?: string[];
}

export type UpdateMeRequest = {
  name?: string | null;
  phone?: string | null;
};

export type UpdateAssociationRequest = {
  managerName?: string | null;
  email?: string | null;
  phone?: string | null;
  fax?: string | null;
  managerTitle?: string | null;
};

export interface AssociationInfoResponse {
  managerName?: string | null;
  email?: string | null;
  phone?: string | null;
  fax?: string | null;
  managerTitle?: string | null;
}

export interface MyPageMarketResponse {
  marketId?: number | string;
  name?: string | null;
  address?: string | null;
  marketType?: string | null;
  mainCategories?: string | null;
  totalStores?: string | number | null;
  operatingHours?: unknown;
  targetCustomers?: string | null;
  contact?: string | null;
  description?: string | null;
}

export interface MyPageResponse {
  profile?: {
    id?: number | string;
    email?: string | null;
    name?: string | null;
    phone?: string | null;
    role?: string | null;
  } | null;
  market?: MyPageMarketResponse | null;
  marketPage?: {
    pageId?: number | string;
    templateType?: string | null;
    heroDescription?: string | null;
    isPublished?: boolean | null;
  } | null;
  storeCount?: number;
  contentCount?: number;
  missing?: string[];
}

export type WebsiteEntryPath = "/dashboard" | "/onboarding" | "/templates";

function unwrapMeResponse(body: unknown): MeResponse {
  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    typeof (body as ApiEnvelope<MeResponse>).data === "object"
  ) {
    return (body as ApiEnvelope<MeResponse>).data ?? {};
  }

  return (body ?? {}) as MeResponse;
}

export async function getMe(user: User): Promise<MeResponse> {
  const idToken = await user.getIdToken();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const response = await fetch(`${baseUrl}/api/me`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  const body = (await response.json().catch(() => ({}))) as
    | ApiEnvelope<MeResponse>
    | MeResponse;

  if (!response.ok || ("success" in body && body.success === false)) {
    const message =
      "error" in body && body.error?.message
        ? body.error.message
        : "내 정보를 불러오지 못했습니다.";
    throw new Error(message);
  }

  return unwrapMeResponse(body);
}

export async function getMyPage(user: User): Promise<MyPageResponse> {
  const idToken = await user.getIdToken();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const response = await fetch(`${baseUrl}/api/mypage`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  const body = (await response.json().catch(() => ({}))) as
    | ApiEnvelope<MyPageResponse>
    | MyPageResponse;

  if (!response.ok || ("success" in body && body.success === false)) {
    const message =
      "error" in body && body.error?.message
        ? body.error.message
        : "마이페이지 정보를 불러오지 못했습니다.";
    throw new Error(message);
  }

  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    typeof (body as ApiEnvelope<MyPageResponse>).data === "object"
  ) {
    return (body as ApiEnvelope<MyPageResponse>).data ?? {};
  }

  return (body ?? {}) as MyPageResponse;
}

export async function deleteMe(user = auth.currentUser): Promise<void> {
  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const idToken = await user.getIdToken();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const response = await fetch(`${baseUrl}/api/me`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${idToken}` },
  });
  const body = (await response.json().catch(() => ({}))) as ApiEnvelope<unknown> & {
    message?: string;
  };

  if (!response.ok || body.success === false) {
    throw new Error(body.error?.message ?? body.message ?? "회원 탈퇴에 실패했습니다.");
  }
}

export async function updateMe(
  profile: UpdateMeRequest,
  user = auth.currentUser,
): Promise<MeResponse> {
  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const idToken = await user.getIdToken();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const response = await fetch(`${baseUrl}/api/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(profile),
  });
  const body = (await response.json().catch(() => ({}))) as
    | ApiEnvelope<MeResponse>
    | MeResponse;

  if (!response.ok || ("success" in body && body.success === false)) {
    const message =
      "error" in body && body.error?.message
        ? body.error.message
        : "내 정보를 수정하지 못했습니다.";
    throw new Error(message);
  }

  return unwrapMeResponse(body);
}

export async function updateAssociation(
  association: UpdateAssociationRequest,
  user = auth.currentUser,
): Promise<AssociationInfoResponse> {
  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const idToken = await user.getIdToken();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const response = await fetch(`${baseUrl}/api/me/association`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(association),
  });
  const body = (await response.json().catch(() => ({}))) as
    | ApiEnvelope<AssociationInfoResponse>
    | AssociationInfoResponse;

  if (!response.ok || ("success" in body && body.success === false)) {
    const message =
      "error" in body && body.error?.message
        ? body.error.message
        : "상인회 담당자 정보를 수정하지 못했습니다.";
    throw new Error(message);
  }

  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    typeof (body as ApiEnvelope<AssociationInfoResponse>).data === "object"
  ) {
    return (body as ApiEnvelope<AssociationInfoResponse>).data ?? {};
  }

  return (body ?? {}) as AssociationInfoResponse;
}

export async function hasGeneratedMarketPage(me: MeResponse): Promise<boolean> {
  if (!me.marketId) return false;

  try {
    await getPublicMarketPageContent(me.marketId);
    return true;
  } catch {
    return false;
  }
}

export async function getWebsiteEntryPath(me: MeResponse): Promise<WebsiteEntryPath> {
  if (!me.marketId) return "/onboarding";
  return (await hasGeneratedMarketPage(me)) ? "/dashboard" : "/templates";
}

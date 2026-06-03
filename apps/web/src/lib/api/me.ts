import type { User } from "firebase/auth";
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

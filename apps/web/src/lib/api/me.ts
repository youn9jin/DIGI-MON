import type { User } from "firebase/auth";

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

export function getWebsiteEntryPath(me: MeResponse): "/templates" | "/onboarding" {
  return me.marketId ? "/templates" : "/onboarding";
}

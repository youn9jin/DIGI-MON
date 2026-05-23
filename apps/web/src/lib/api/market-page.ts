import { auth } from "@/lib/firebase";

export type TemplateType = "TEMPLATE_1" | "TEMPLATE_2" | "TEMPLATE_3";
export type MarketPageStatus = "PENDING" | "DONE" | "FAILED";

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: {
    code?: string;
    message?: string;
  };
}

export interface CreateMarketPageResponse {
  jobId: string | number;
  status: MarketPageStatus;
  message?: string;
}

export interface MarketPageStatusResponse {
  jobId: string | number;
  status: MarketPageStatus;
  pageId?: number;
  error?: string;
}

export interface MarketPageApiError {
  status: number;
  message: string;
}

async function getAuthorizationHeader(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) {
    throw { status: 401, message: "로그인이 필요합니다." } as MarketPageApiError;
  }

  const idToken = await user.getIdToken();
  return { Authorization: `Bearer ${idToken}` };
}

async function parseEnvelope<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;

  if (!response.ok || body.success === false || !body.data) {
    throw {
      status: response.status,
      message: body.error?.message ?? "웹페이지 생성 요청에 실패했습니다.",
    } as MarketPageApiError;
  }

  return body.data;
}

export async function createMarketPage(
  templateType: TemplateType,
): Promise<CreateMarketPageResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const authHeader = await getAuthorizationHeader();
  const response = await fetch(`${baseUrl}/api/market/page`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
    body: JSON.stringify({ templateType }),
  });

  return parseEnvelope<CreateMarketPageResponse>(response);
}

export async function getMarketPageStatus(
  jobId: string | number,
): Promise<MarketPageStatusResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const authHeader = await getAuthorizationHeader();
  const response = await fetch(
    `${baseUrl}/api/market/page/status/${encodeURIComponent(String(jobId))}`,
    { headers: authHeader },
  );

  return parseEnvelope<MarketPageStatusResponse>(response);
}

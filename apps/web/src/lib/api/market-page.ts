import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export type TemplateType = "TEMPLATE_1" | "TEMPLATE_2" | "TEMPLATE_3";
export type MarketPageStatus = "PENDING" | "DONE" | "FAILED";

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  error?: {
    code?: string;
    message?: string;
  };
}

export interface CreateMarketPageResponse {
  pageId: string | number;
  marketId?: string | number;
  jobId?: string | number;
  status: MarketPageStatus;
  message?: string;
}

export interface MarketPageStatusResponse {
  pageId?: string | number;
  marketId?: string | number;
  jobId?: string | number;
  status: MarketPageStatus;
  error?: string;
}

export interface MarketPageApiError {
  status: number;
  code?: string;
  message: string;
}

export type MarketPageSection = "intro" | "history" | "directions" | "stores" | "tourism";

export interface MarketPageSetupRequest {
  templateType: TemplateType;
  selectedSections: MarketPageSection[];
  marketContent?: {
    introText?: string;
    historyText?: string;
    directionsText?: string;
  };
}

export interface MarketPageSetupResponse {
  marketId: string | number;
  templateType: TemplateType;
  selectedSections: MarketPageSection[];
}

export interface UpdateMarketPageTextRequest {
  heroSubtitle?: string;
  introContent?: string;
  feature1Description?: string;
  feature2Description?: string;
  historyText?: string;
  directionsText?: string;
}

export interface UpdateMarketPageTextResponse {
  marketId: string | number;
  updatedFields: (keyof UpdateMarketPageTextRequest)[];
}

export interface UpdateMarketPageTemplateRequest {
  templateType: TemplateType;
}

export interface UpdateMarketPageTemplateResponse {
  marketId: string | number;
  templateType: TemplateType;
}

export interface MarketPageContentResponse {
  pageId: string | number;
  marketId?: string | number;
  templateType?: TemplateType | string | null;
  selectedSections?: MarketPageSection[] | string[] | null;
  marketName?: string | null;
  address?: string | null;
  contact?: string | null;
  hero?: {
    title?: string;
    subtitle?: string;
    description?: string;
  } | null;
  intro?: {
    content?: string;
  } | null;
  features?: {
    title?: string;
    description?: string;
  }[] | null;
  storeHighlights?: {
    storeName?: string;
    highlight?: string;
  }[] | null;
  cta?: {
    text?: string;
  } | null;
}

interface RawCreateMarketPageResponse {
  pageId?: string | number;
  marketId?: string | number;
  jobId?: string | number;
  status?: MarketPageStatus;
  message?: string;
}

interface MarketPageStatusEvent {
  pageId?: string | number;
  marketId?: string | number;
  status?: MarketPageStatus;
  error?: string;
}

async function getAuthenticatedUser(): Promise<User> {
  const currentUser = auth.currentUser;
  if (currentUser) return currentUser;

  const user = await new Promise<User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (changedUser) => {
      unsubscribe();
      resolve(changedUser);
    });
  });

  if (!user) {
    throw { status: 401, message: "로그인이 필요합니다." } as MarketPageApiError;
  }

  return user;
}

async function getAuthorizationHeader(): Promise<HeadersInit> {
  const user = await getAuthenticatedUser();
  const idToken = await user.getIdToken();
  return { Authorization: `Bearer ${idToken}` };
}

async function parseEnvelope<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as ApiEnvelope<T> & {
    message?: string;
  };

  if (!response.ok || body.success === false) {
    const serverMessage = body.error?.message ?? body.message;
    const message =
      serverMessage === "Unexpected error occurred"
        ? "생성 결과를 불러오는 중 서버 오류가 발생했습니다. 다시 생성해보세요."
        : serverMessage ?? "웹페이지 생성 요청에 실패했습니다.";

    throw {
      status: response.status,
      code: body.error?.code,
      message,
    } as MarketPageApiError;
  }

  if ("data" in body) {
    if (body.data == null) {
      throw {
        status: response.status,
        code: body.error?.code,
        message: body.error?.message ?? body.message ?? "응답 데이터가 비어 있습니다.",
      } as MarketPageApiError;
    }

    return body.data;
  }

  return body as T;
}

export async function saveMarketPageSetup(
  setup: MarketPageSetupRequest,
): Promise<MarketPageSetupResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const authHeader = await getAuthorizationHeader();
  const response = await fetch(`${baseUrl}/api/market/page/setup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
    body: JSON.stringify(setup),
  });

  return parseEnvelope<MarketPageSetupResponse>(response);
}

export async function updateMarketPageText(
  text: UpdateMarketPageTextRequest,
): Promise<UpdateMarketPageTextResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const authHeader = await getAuthorizationHeader();
  const response = await fetch(`${baseUrl}/api/market/page/text`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
    body: JSON.stringify(text),
  });

  return parseEnvelope<UpdateMarketPageTextResponse>(response);
}

export async function updateMarketPageTemplate(
  template: UpdateMarketPageTemplateRequest,
): Promise<UpdateMarketPageTemplateResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const authHeader = await getAuthorizationHeader();
  const response = await fetch(`${baseUrl}/api/market/page/template`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
    body: JSON.stringify(template),
  });

  return parseEnvelope<UpdateMarketPageTemplateResponse>(response);
}

export async function createMarketPage(
  templateType?: TemplateType,
): Promise<CreateMarketPageResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const authHeader = await getAuthorizationHeader();
  const response = await fetch(`${baseUrl}/api/market/page`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
    body: templateType ? JSON.stringify({ templateType }) : undefined,
  });

  const data = await parseEnvelope<RawCreateMarketPageResponse>(response);
  const pageId = data.pageId ?? data.jobId ?? data.marketId;

  if (pageId == null) {
    throw {
      status: response.status,
      message: "웹페이지 생성 응답에 pageId가 없습니다.",
    } as MarketPageApiError;
  }

  return {
    pageId,
    marketId: data.marketId,
    jobId: data.jobId,
    status: data.status ?? "PENDING",
    message: data.message,
  };
}

export async function getMarketPageStatus(
  jobId: string | number,
): Promise<MarketPageStatusResponse> {
  return new Promise((resolve, reject) => {
    subscribeMarketPageStatus(jobId, {
      onDone: resolve,
      onFailed: resolve,
      onError: reject,
    }).catch(reject);
  });
}

export async function subscribeMarketPageStatus(
  pageId: string | number,
  callbacks: {
    onDone: (status: MarketPageStatusResponse) => void;
    onFailed: (status: MarketPageStatusResponse) => void;
    onError?: (error: MarketPageApiError) => void;
  },
): Promise<() => void> {
  const user = await getAuthenticatedUser();
  const idToken = await user.getIdToken();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const url = new URL(
    `${baseUrl}/api/market/page/status/${encodeURIComponent(String(pageId))}`,
    window.location.origin,
  );
  url.searchParams.set("token", idToken);

  const eventSource = new EventSource(url.toString());

  function parseStatus(event: MessageEvent): MarketPageStatusResponse {
    const data = JSON.parse(event.data) as MarketPageStatusEvent;
    return {
      pageId: data.pageId ?? pageId,
      marketId: data.marketId,
      status: data.status ?? "PENDING",
      error: data.error,
    };
  }

  eventSource.addEventListener("done", (event) => {
    eventSource.close();
    callbacks.onDone(parseStatus(event as MessageEvent));
  });

  eventSource.addEventListener("failed", (event) => {
    eventSource.close();
    callbacks.onFailed(parseStatus(event as MessageEvent));
  });

  eventSource.onerror = () => {
    eventSource.close();
    callbacks.onError?.({
      status: 0,
      message: "웹페이지 생성 상태 연결에 실패했습니다.",
    });
  };

  return () => eventSource.close();
}

export async function getMarketPageContent(
  pageId: string | number,
): Promise<MarketPageContentResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const authHeader = await getAuthorizationHeader();
  const response = await fetch(
    `${baseUrl}/api/market/page/${encodeURIComponent(String(pageId))}`,
    { headers: authHeader },
  );

  return parseEnvelope<MarketPageContentResponse>(response);
}

export async function getPublicMarketPageContent(
  marketId: string | number,
): Promise<MarketPageContentResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const response = await fetch(
    `${baseUrl}/api/market/${encodeURIComponent(String(marketId))}`,
  );

  return parseEnvelope<MarketPageContentResponse>(response);
}

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
  heroImageUrl?: string | null;
  logoImageUrl?: string | null;
  introImageUrls?: string[] | null;
}

export interface MarketPageSetupResponse {
  marketId: string | number;
  templateType: TemplateType;
  selectedSections: MarketPageSection[];
  heroImageUrl?: string | null;
  logoImageUrl?: string | null;
  introImageUrls?: string[] | null;
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

export interface UpdateMarketInfoRequest {
  name?: string | null;
  address?: string | null;
  marketType?: string | null;
  totalStores?: string | null;
  operatingHours?: {
    weekday?: string | null;
    weekend?: string | null;
  } | null;
  contact?: string | null;
}

export interface UpdateMarketInfoResponse {
  marketId?: string | number;
  name?: string;
  address?: string;
  marketType?: string;
  totalStores?: string;
  operatingHours?: {
    weekday?: string | null;
    weekend?: string | null;
  } | null;
  contact?: string | null;
  message?: string;
}

export interface MarketPageContentResponse {
  pageId: string | number;
  marketId?: string | number;
  templateType?: TemplateType | string | null;
  selectedSections?: MarketPageSection[] | string[] | null;
  marketName?: string | null;
  address?: string | null;
  contact?: string | null;
  heroImageUrl?: string | null;
  logoImageUrl?: string | null;
  introImageUrls?: string[] | null;
  introText?: string | null;
  historyText?: string | null;
  directionsText?: string | null;
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
  stores?: {
    storeId?: string | number | null;
    id?: string | number | null;
    name?: string | null;
    storeName?: string | null;
    category?: string | null;
    items?: string | null;
    operatingHours?: string | null;
    yearsOfOperation?: string | null;
    contact?: string | null;
    description?: string | null;
    highlight?: string | null;
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

function getMarketPageErrorMessage(
  status: number,
  code?: string,
  serverMessage?: string,
): string {
  if (code === "PAGE_NOT_FOUND") {
    return "아직 공개할 수 있는 웹페이지가 없습니다. 생성이 완료된 뒤 다시 확인해주세요.";
  }
  if (code === "CONTENT_PARSE_ERROR") {
    return "생성된 웹페이지 내용을 읽는 중 문제가 생겼습니다. 다시 생성하면 해결될 수 있어요.";
  }
  if (code === "MARKET_NOT_FOUND") {
    return "연결된 시장 정보를 찾지 못했습니다. 온보딩 정보를 먼저 확인해주세요.";
  }
  if (status >= 500) {
    return "서버에서 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
  if (serverMessage === "Unexpected error occurred") {
    return "생성 결과를 불러오는 중 서버 오류가 발생했습니다. 다시 생성해보세요.";
  }
  return serverMessage ?? "웹페이지 생성 요청에 실패했습니다.";
}

async function parseEnvelope<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as ApiEnvelope<T> & {
    message?: string;
  };

  if (!response.ok || body.success === false) {
    const serverMessage = body.error?.message ?? body.message;
    const code = body.error?.code;
    const message = getMarketPageErrorMessage(response.status, code, serverMessage);

    throw {
      status: response.status,
      code,
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

export async function updateMarketInfo(
  market: UpdateMarketInfoRequest,
): Promise<UpdateMarketInfoResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const authHeader = await getAuthorizationHeader();
  const response = await fetch(`${baseUrl}/api/market`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
    body: JSON.stringify(market),
  });

  return parseEnvelope<UpdateMarketInfoResponse>(response);
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
      message:
        "생성 상태 연결이 잠시 끊겼어요. 생성은 계속 진행될 수 있으니 웹사이트 관리에서 다시 확인해주세요.",
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

import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: {
    code?: string;
    message?: string;
  };
  message?: string;
}

export interface StoreCreateItem {
  name: string;
  category: string;
  items?: string;
  operatingHours?: string;
  yearsOfOperation?: string;
  contact?: string;
  description?: string;
  storeImageUrls?: string[];
  menuImageUrls?: string[];
  productImageUrls?: string[];
}

export interface CreateStoresResponse {
  requestedCount?: number;
  successCount: number;
  failedCount?: number;
  successStoreIds: Array<string | number>;
  failedItems: {
    index: number;
    name?: string;
    reason: string;
  }[];
  message?: string;
}

export interface StoreSummary {
  storeId: string | number;
  name: string;
  category: string;
  items?: string | null;
  operatingHours?: string | null;
  yearsOfOperation?: string | null;
  contact?: string | null;
  description?: string | null;
  storeImageUrls?: string[] | null;
  menuImageUrls?: string[] | null;
  productImageUrls?: string[] | null;
}

export interface StoreDetail extends StoreSummary {
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type StoreUpdateRequest = {
  name?: string;
  category?: string;
  items?: string | null;
  operatingHours?: string | null;
  yearsOfOperation?: string | null;
  contact?: string | null;
  description?: string | null;
  storeImageUrls?: string[] | null;
  menuImageUrls?: string[] | null;
  productImageUrls?: string[] | null;
};

export interface StoreListResponse {
  total: number;
  stores: StoreSummary[];
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
    throw new Error("로그인이 필요합니다.");
  }

  return user;
}

async function getAuthorizationHeader(): Promise<HeadersInit> {
  const user = await getAuthenticatedUser();
  const idToken = await user.getIdToken();
  return { Authorization: `Bearer ${idToken}` };
}

async function parseEnvelope<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;

  if (!response.ok || body.success === false) {
    throw new Error(
      body.error?.message ?? body.message ?? "점포 등록 요청에 실패했습니다.",
    );
  }

  return (body.data ?? body) as T;
}

export async function createStores(
  stores: StoreCreateItem[],
): Promise<CreateStoresResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const authHeader = await getAuthorizationHeader();
  const response = await fetch(`${baseUrl}/api/stores`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
    body: JSON.stringify({ stores }),
  });

  return parseEnvelope<CreateStoresResponse>(response);
}

export async function getStores(): Promise<StoreListResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const authHeader = await getAuthorizationHeader();
  const response = await fetch(`${baseUrl}/api/stores`, {
    headers: authHeader,
  });

  return parseEnvelope<StoreListResponse>(response);
}

export async function getStore(storeId: string | number): Promise<StoreDetail> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const authHeader = await getAuthorizationHeader();
  const response = await fetch(`${baseUrl}/api/stores/${encodeURIComponent(String(storeId))}`, {
    headers: authHeader,
  });

  return parseEnvelope<StoreDetail>(response);
}

export async function updateStore(
  storeId: string | number,
  store: StoreUpdateRequest,
): Promise<StoreDetail> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const authHeader = await getAuthorizationHeader();
  const response = await fetch(`${baseUrl}/api/stores/${encodeURIComponent(String(storeId))}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
    body: JSON.stringify(store),
  });

  return parseEnvelope<StoreDetail>(response);
}

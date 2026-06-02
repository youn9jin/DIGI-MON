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
}

export interface CreateStoresResponse {
  requestedCount: number;
  successCount: number;
  successStoreIds: Array<string | number>;
  failedItems: {
    index: number;
    name?: string;
    reason: string;
  }[];
}

async function getAuthorizationHeader(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

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

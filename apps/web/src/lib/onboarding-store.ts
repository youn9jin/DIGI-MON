export interface OnboardingData {
  marketName?: string;
  address?: string;
  detailAddress?: string;
  zonecode?: string;
  marketType?: string;
  mainCategories?: string[];
  totalStores?: string;
  weekdayOpen?: string;
  weekdayClose?: string;
  weekendOpen?: string;
  weekendClose?: string;
  operatingDays?: string[];
  closedSunday?: boolean;
  closedHolidays?: boolean;
  targetCustomers?: string;
  contactNumber?: string;
  introduction?: string;
  managerName?: string;
  managerRole?: string;
}

const STORAGE_KEY = "onboarding_data";

export function saveOnboardingData(partial: Partial<OnboardingData>): void {
  if (typeof window === "undefined") return;
  const existing = getOnboardingData();
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...partial }));
}

export function getOnboardingData(): OnboardingData {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function clearOnboardingData(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

import type { ClassicStore } from "@/components/templates/classicStoreData";
import type { StoreDetail, StoreSummary } from "@/lib/api/stores";

export interface TemplateStore {
  id: string;
  category: string;
  name: string;
  intro: string;
  hours: string;
  phone: string;
  menu: string;
  description: string;
}

export interface PublicStoreLike {
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
}

export function normalizeStoreCategory(category?: string | null): string {
  const value = category?.trim();
  if (!value) return "기타";
  if (value === "농수산물") return "농/수산물";
  if (value === "농/수산물") return value;
  if (["먹거리", "의류", "생활용품", "기타"].includes(value)) return value;
  return "기타";
}

function firstText(...values: Array<string | null | undefined>): string {
  return values.find((value) => value && value.trim().length > 0)?.trim() ?? "";
}

export function mapStoreToTemplateStore(
  store: StoreSummary | StoreDetail | PublicStoreLike | ClassicStore,
  index = 0,
): TemplateStore {
  const source = store as StoreSummary & PublicStoreLike & ClassicStore;
  const name = firstText(source.name, source.storeName, `가게이름 ${index + 1}`);
  const description = firstText(source.description, source.highlight, source.intro);
  const menu = firstText(source.items, source.menu, "대표 메뉴 정보 준비 중");

  return {
    id: String(source.storeId ?? source.id ?? index + 1),
    category: normalizeStoreCategory(source.category),
    name,
    intro: firstText(description, menu, `${name} 소개`),
    hours: firstText(source.operatingHours, source.hours, "영업시간 정보 준비 중"),
    phone: firstText(source.contact, source.phone, "연락처 정보 준비 중"),
    menu,
    description: firstText(description, menu, `${name}의 대표 상품을 소개합니다.`),
  };
}

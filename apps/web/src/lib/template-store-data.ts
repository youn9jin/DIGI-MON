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
  storeImageUrls: string[];
  menuImageUrls: string[];
  productImageUrls: string[];
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
  imageUrl?: string | null;
  storeImageUrl?: string | null;
  menuImageUrl?: string | null;
  productImageUrl?: string | null;
  thumbnailUrl?: string | null;
  photoUrl?: string | null;
  images?: unknown;
  imageUrls?: unknown;
  photoUrls?: unknown;
  storeImages?: unknown;
  menuImages?: unknown;
  productImages?: unknown;
  storeImageUrls?: unknown;
  menuImageUrls?: unknown;
  productImageUrls?: unknown;
}

function normalizeStoreIdentity(value?: string | null): string {
  return value?.trim().replace(/\s+/g, " ").toLowerCase() ?? "";
}

export function getUniqueTemplateStores(
  stores: TemplateStore[],
): TemplateStore[] {
  const seenIds = new Set<string>();
  const seenStores = new Set<string>();

  return stores.filter((store) => {
    const id = store.id.trim();
    const contentKey = [
      normalizeStoreIdentity(store.category),
      normalizeStoreIdentity(store.name),
      normalizeStoreIdentity(store.phone),
    ].join("|");

    if ((id && seenIds.has(id)) || seenStores.has(contentKey)) {
      return false;
    }

    if (id) seenIds.add(id);
    seenStores.add(contentKey);
    return true;
  });
}

export function normalizeStoreCategory(category?: string | null): string {
  const value = category?.trim();
  if (!value) return "기타";
  if (value === "농수산물") return "농/수산물";
  if (value === "농/수산물") return value;
  if (value === "음식점") return "먹거리";
  if (["먹거리", "의류", "생활용품", "기타"].includes(value)) return value;
  return "기타";
}

const DEFAULT_STORE_IMAGES: Record<string, string> = {
  "농/수산물": "/images/stores/defaults/agriculture-seafood.jpg",
  먹거리: "/images/stores/defaults/food.jpg",
  의류: "/images/stores/defaults/clothing.jpg",
  생활용품: "/images/stores/defaults/household.jpg",
  기타: "/images/stores/defaults/other.jpg",
};

export function getDefaultStoreImage(category?: string | null): string {
  return DEFAULT_STORE_IMAGES[normalizeStoreCategory(category)];
}

function isDefaultStoreImage(url: string): boolean {
  return Object.values(DEFAULT_STORE_IMAGES).includes(url);
}

export function preferUploadedStoreImages(
  primaryImages: string[],
  fallbackImages: string[],
): string[] {
  const primaryUploaded = primaryImages.filter(
    (url) => !isDefaultStoreImage(url),
  );
  if (primaryUploaded.length > 0) return primaryUploaded;

  const fallbackUploaded = fallbackImages.filter(
    (url) => !isDefaultStoreImage(url),
  );
  if (fallbackUploaded.length > 0) return fallbackUploaded;

  return primaryImages.length > 0 ? primaryImages : fallbackImages;
}

function firstText(...values: Array<string | null | undefined>): string {
  return values.find((value) => value && value.trim().length > 0)?.trim() ?? "";
}

function normalizeImageUrls(...sources: unknown[]): string[] {
  const urls = sources.flatMap((source) => {
    if (typeof source === "string") return [source];
    if (!Array.isArray(source)) return [];

    return source.flatMap((item) => {
      if (typeof item === "string") return [item];
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        return [record.url, record.imageUrl, record.downloadUrl].filter(
          (value): value is string => typeof value === "string",
        );
      }
      return [];
    });
  });

  return Array.from(
    new Set(urls.map((url) => url.trim()).filter((url) => url.length > 0)),
  );
}

export function mapStoreToTemplateStore(
  store: StoreSummary | StoreDetail | PublicStoreLike | ClassicStore,
  index = 0,
): TemplateStore {
  const source = store as StoreSummary & PublicStoreLike & ClassicStore;
  const sourceRecord = source as unknown as Record<string, unknown>;
  const name = firstText(source.name, source.storeName, `가게이름 ${index + 1}`);
  const description = firstText(source.description, source.highlight, source.intro);
  const menu = firstText(source.items, source.menu, "대표 메뉴 정보 준비 중");
  const category = normalizeStoreCategory(source.category);
  const uploadedStoreImageUrls = normalizeImageUrls(
    source.storeImageUrls,
    sourceRecord.store_image_urls,
    source.storeImages,
    sourceRecord.store_images,
    source.storeImageUrl,
    sourceRecord.store_image_url,
    sourceRecord.storeImageUrlList,
    sourceRecord.store_image_url_list,
    sourceRecord.storeImageList,
    sourceRecord.store_image_list,
    sourceRecord.storeImage,
    sourceRecord.store_image,
    source.imageUrls,
    sourceRecord.image_urls,
    sourceRecord.imageUrlList,
    sourceRecord.image_url_list,
    source.images,
    source.imageUrl,
    sourceRecord.image_url,
    source.photoUrls,
    sourceRecord.photo_urls,
    source.photoUrl,
    sourceRecord.photo_url,
    source.thumbnailUrl,
    sourceRecord.thumbnail_url,
  );
  const storeImageUrls =
    uploadedStoreImageUrls.length > 0
      ? uploadedStoreImageUrls
      : [getDefaultStoreImage(category)];

  return {
    id: String(source.storeId ?? source.id ?? index + 1),
    category,
    name,
    intro: firstText(description, menu, `${name} 소개`),
    hours: firstText(source.operatingHours, source.hours, "영업시간 정보 준비 중"),
    phone: firstText(source.contact, source.phone, "연락처 정보 준비 중"),
    menu,
    description: firstText(description, menu, `${name}의 대표 상품을 소개합니다.`),
    storeImageUrls,
    menuImageUrls: normalizeImageUrls(
      source.menuImageUrls,
      sourceRecord.menu_image_urls,
      sourceRecord.menuImageUrlList,
      sourceRecord.menu_image_url_list,
      sourceRecord.menuImageList,
      sourceRecord.menu_image_list,
      source.menuImages,
      sourceRecord.menu_images,
      source.menuImageUrl,
      sourceRecord.menu_image_url,
      sourceRecord.menuImage,
      sourceRecord.menu_image,
      sourceRecord.menuBoardImageUrls,
      sourceRecord.menu_board_image_urls,
      sourceRecord.menuBoardImages,
      sourceRecord.menu_board_images,
    ),
    productImageUrls: normalizeImageUrls(
      source.productImageUrls,
      sourceRecord.product_image_urls,
      sourceRecord.productImageUrlList,
      sourceRecord.product_image_url_list,
      sourceRecord.productImageList,
      sourceRecord.product_image_list,
      source.productImages,
      sourceRecord.product_images,
      source.productImageUrl,
      sourceRecord.product_image_url,
      sourceRecord.productImage,
      sourceRecord.product_image,
      sourceRecord.menu_item_image_urls,
      sourceRecord.menuItemImageUrls,
      sourceRecord.menu_item_image_url_list,
      sourceRecord.product_urls,
    ),
  };
}

"use client";

import Image from "next/image";
import { onAuthStateChanged, type User } from "firebase/auth";
import { type FormEvent, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Header from "@/components/layout/Header";
import { auth } from "@/lib/firebase";
import {
  getMarketPageContent,
  getPublicMarketPageContent,
  type MarketPageContentResponse,
  type MarketPageApiError,
  type TemplateType,
  type UpdateMarketPageTextRequest,
  updateMarketPageText,
} from "@/lib/api/market-page";
import { getMe } from "@/lib/api/me";
import {
  getStore,
  getStores,
  updateStore,
  type StoreDetail,
  type StoreSummary,
  type StoreUpdateRequest,
} from "@/lib/api/stores";
import styles from "../manage.module.css";

const setupStorageKey = "market_page_setup_draft";
const generatedPageIdStorageKey = "generated_market_page_id";

type MarketTextFieldId = "marketIntro" | "summary" | "history" | "intro1" | "intro2" | "parking";

type MarketField = {
  id: MarketTextFieldId;
  label: string;
  placeholder: string;
  rows: 1 | 4;
};

type SetupDraft = {
  templateType?: TemplateType | string | null;
};

type StoreFormValues = {
  name: string;
  category: string;
  description: string;
  operatingHours: string;
  contact: string;
  yearsOfOperation: string;
  items: string;
};

const storeCategories = ["전체보기", "농수산물", "먹거리", "의류", "생활용품", "기타"] as const;

const emptyStoreFormValues: StoreFormValues = {
  name: "",
  category: "기타",
  description: "",
  operatingHours: "",
  contact: "",
  yearsOfOperation: "",
  items: "",
};

const marketFieldsByTemplate: Record<TemplateType, MarketField[]> = {
  TEMPLATE_1: [
    {
      id: "marketIntro",
      label: "1. 시장 소개 수정하기(300자 이내)",
      placeholder: "(기존 한 줄 소개 내용)",
      rows: 1,
    },
    {
      id: "intro1",
      label: "2. 시장 대표 소개글 1 수정하기(300자 이내)",
      placeholder: "(기존 소개글 내용)",
      rows: 4,
    },
    {
      id: "intro2",
      label: "3. 시장 대표 소개글 2 수정하기(300자 이내)",
      placeholder: "(기존 소개글 내용)",
      rows: 4,
    },
    {
      id: "parking",
      label: "4. 시장 위치(주차장) 정보 수정하기",
      placeholder: "(기존 위치)",
      rows: 1,
    },
  ],
  TEMPLATE_2: [
    {
      id: "summary",
      label: "1. 시장 한 줄 소개 수정하기(50자 이내)",
      placeholder: "(기존 한 줄 소개 내용)",
      rows: 1,
    },
    {
      id: "history",
      label: "2. 시장 역사 수정하기(200자 이내)",
      placeholder: "(기존 시장 역사 내용)",
      rows: 4,
    },
    {
      id: "intro1",
      label: "3. 시장 대표 소개글 1 수정하기(300자 이내)",
      placeholder: "(기존 소개글 내용)",
      rows: 4,
    },
    {
      id: "intro2",
      label: "4. 시장 대표 소개글 2 수정하기(300자 이내)",
      placeholder: "(기존 소개글 내용)",
      rows: 4,
    },
    {
      id: "parking",
      label: "5. 시장 위치(주차장) 정보 수정하기",
      placeholder: "(기존 위치)",
      rows: 1,
    },
  ],
  TEMPLATE_3: [
    {
      id: "summary",
      label: "1. 시장 한 줄 소개 수정하기(50자 이내)",
      placeholder: "(기존 한 줄 소개 내용)",
      rows: 1,
    },
    {
      id: "intro1",
      label: "2. 시장 대표 소개글 1 수정하기(300자 이내)",
      placeholder: "(기존 소개글 내용)",
      rows: 4,
    },
    {
      id: "intro2",
      label: "3. 시장 대표 소개글 2 수정하기(300자 이내)",
      placeholder: "(기존 소개글 내용)",
      rows: 4,
    },
    {
      id: "parking",
      label: "4. 시장 위치(주차장) 정보 수정하기",
      placeholder: "(기존 위치 정보)",
      rows: 1,
    },
  ],
};

const textApiFieldByTemplate: Record<
  TemplateType,
  Partial<Record<MarketTextFieldId, keyof UpdateMarketPageTextRequest>>
> = {
  TEMPLATE_1: {
    marketIntro: "introContent",
    intro1: "feature1Description",
    intro2: "feature2Description",
    parking: "directionsText",
  },
  TEMPLATE_2: {
    summary: "heroSubtitle",
    history: "historyText",
    intro1: "feature1Description",
    intro2: "feature2Description",
    parking: "directionsText",
  },
  TEMPLATE_3: {
    summary: "heroSubtitle",
    intro1: "feature1Description",
    intro2: "feature2Description",
    parking: "directionsText",
  },
};

const textMaxLengthByApiField: Record<keyof UpdateMarketPageTextRequest, number> = {
  heroSubtitle: 50,
  introContent: 300,
  feature1Description: 300,
  feature2Description: 300,
  historyText: 200,
  directionsText: 500,
};

function getTemplateType(value?: string | null): TemplateType | null {
  if (value === "TEMPLATE_1" || value === "TEMPLATE_2" || value === "TEMPLATE_3") {
    return value;
  }

  return null;
}

function getInitialTemplateType(): TemplateType {
  if (typeof window === "undefined") return "TEMPLATE_1";

  const queryTemplate = getTemplateType(new URLSearchParams(window.location.search).get("template"));
  if (queryTemplate) return queryTemplate;

  try {
    const savedDraft = window.sessionStorage.getItem(setupStorageKey);
    if (!savedDraft) return "TEMPLATE_1";

    const parsed = JSON.parse(savedDraft) as SetupDraft;
    return getTemplateType(parsed.templateType) ?? "TEMPLATE_1";
  } catch {
    return "TEMPLATE_1";
  }
}

function subscribeToTemplateType() {
  return () => {};
}

function getFieldMaxLength(apiField?: keyof UpdateMarketPageTextRequest) {
  return apiField ? textMaxLengthByApiField[apiField] : undefined;
}

function getStoredPageId() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(generatedPageIdStorageKey);
}

async function getCurrentUser(): Promise<User | null> {
  if (auth.currentUser) return auth.currentUser;

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

function getContentValueByField(
  content: MarketPageContentResponse,
  fieldId: MarketTextFieldId,
) {
  if (fieldId === "summary") return content.hero?.subtitle ?? "";
  if (fieldId === "marketIntro") return content.introText ?? content.intro?.content ?? "";
  if (fieldId === "history") return content.historyText ?? "";
  if (fieldId === "intro1") return content.features?.[0]?.description ?? "";
  if (fieldId === "intro2") return content.features?.[1]?.description ?? "";
  if (fieldId === "parking") return content.directionsText ?? "";
  return "";
}

function getValuesFromContent(
  content: MarketPageContentResponse,
  fields: MarketField[],
): Partial<Record<MarketTextFieldId, string>> {
  return fields.reduce<Partial<Record<MarketTextFieldId, string>>>((values, field) => {
    const value = getContentValueByField(content, field.id);
    if (value) {
      values[field.id] = value;
    }
    return values;
  }, {});
}

function getStoreValues(store: StoreDetail): StoreFormValues {
  return {
    name: store.name ?? "",
    category: store.category ?? "기타",
    description: store.description ?? "",
    operatingHours: store.operatingHours ?? "",
    contact: store.contact ?? "",
    yearsOfOperation: store.yearsOfOperation ?? "",
    items: store.items ?? "",
  };
}

function getStoreSearchText(store: StoreSummary) {
  return `${store.name} ${store.category} ${store.items ?? ""}`.toLowerCase();
}

function toNullableValue(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function appendChangedValue<T extends keyof StoreUpdateRequest>(
  payload: StoreUpdateRequest,
  key: T,
  nextValue: StoreUpdateRequest[T],
  previousValue?: string | number | null,
) {
  const normalizedPrevious = previousValue == null ? null : String(previousValue).trim();
  const normalizedNext = nextValue == null ? null : String(nextValue).trim();

  if (normalizedNext !== normalizedPrevious) {
    payload[key] = nextValue;
  }
}

async function getContentByMyMarket() {
  const user = await getCurrentUser();
  if (!user) {
    throw { status: 401, message: "로그인이 필요합니다." } as MarketPageApiError;
  }

  const me = await getMe(user);
  if (!me.marketId) {
    throw {
      status: 404,
      message: "등록된 시장 정보를 찾을 수 없습니다.",
    } as MarketPageApiError;
  }

  return getPublicMarketPageContent(me.marketId);
}

async function getExistingMarketPageContent() {
  const storedPageId = getStoredPageId();

  if (!storedPageId) {
    return getContentByMyMarket();
  }

  try {
    return await getMarketPageContent(storedPageId);
  } catch {
    return getContentByMyMarket();
  }
}

export default function InfoEditPage() {
  const [tab, setTab] = useState<"market" | "store">("market");
  const [marketValues, setMarketValues] = useState<Partial<Record<MarketTextFieldId, string>>>({});
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [contentError, setContentError] = useState("");
  const [stores, setStores] = useState<StoreSummary[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreDetail | null>(null);
  const [storeValues, setStoreValues] = useState<StoreFormValues>(emptyStoreFormValues);
  const [storeCategory, setStoreCategory] = useState<(typeof storeCategories)[number]>("전체보기");
  const [storeSearch, setStoreSearch] = useState("");
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [isLoadingStoreDetail, setIsLoadingStoreDetail] = useState(false);
  const [isSavingStore, setIsSavingStore] = useState(false);
  const [storeError, setStoreError] = useState("");
  const [storeSaveMessage, setStoreSaveMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const templateType = useSyncExternalStore<TemplateType>(
    subscribeToTemplateType,
    getInitialTemplateType,
    () => "TEMPLATE_1",
  );

  const marketFields = marketFieldsByTemplate[templateType];
  const apiFieldByFieldId = useMemo(() => textApiFieldByTemplate[templateType], [templateType]);
  const filteredStores = useMemo(() => {
    const normalizedSearch = storeSearch.trim().toLowerCase();

    return stores.filter((store) => {
      const matchesCategory = storeCategory === "전체보기" || store.category === storeCategory;
      const matchesSearch =
        normalizedSearch.length === 0 || getStoreSearchText(store).includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [storeCategory, storeSearch, stores]);

  useEffect(() => {
    let isMounted = true;

    async function loadExistingContent() {
      setIsLoadingContent(true);
      setContentError("");

      try {
        const content = await getExistingMarketPageContent();

        if (!isMounted) return;
        setMarketValues(getValuesFromContent(content, marketFieldsByTemplate[templateType]));
      } catch (error) {
        if (!isMounted) return;
        const apiError = error as Partial<MarketPageApiError>;
        setContentError(apiError.message ?? "기존 내용을 불러오지 못했습니다.");
      } finally {
        if (isMounted) {
          setIsLoadingContent(false);
        }
      }
    }

    loadExistingContent();

    return () => {
      isMounted = false;
    };
  }, [templateType]);

  useEffect(() => {
    if (tab !== "store") return;

    let isMounted = true;

    async function loadStores() {
      setIsLoadingStores(true);
      setStoreError("");

      try {
        const result = await getStores();
        if (!isMounted) return;
        setStores(result.stores);
        setSelectedStore(null);
        setStoreValues(emptyStoreFormValues);
        setStoreSaveMessage("");
      } catch (error) {
        if (!isMounted) return;
        const apiError = error as Partial<MarketPageApiError>;
        setStoreError(apiError.message ?? "점포 목록을 불러오지 못했습니다.");
      } finally {
        if (isMounted) {
          setIsLoadingStores(false);
        }
      }
    }

    loadStores();

    return () => {
      isMounted = false;
    };
  }, [tab]);

  async function handleSelectStore(storeId: string | number) {
    setIsLoadingStoreDetail(true);
    setStoreError("");

    try {
      const detail = await getStore(storeId);
      setSelectedStore(detail);
      setStoreValues(getStoreValues(detail));
      setStoreSaveMessage("");
    } catch (error) {
      const apiError = error as Partial<MarketPageApiError>;
      setStoreError(apiError.message ?? "점포 상세 정보를 불러오지 못했습니다.");
    } finally {
      setIsLoadingStoreDetail(false);
    }
  }

  function updateFieldValue(fieldId: MarketTextFieldId, value: string) {
    setMarketValues((current) => ({
      ...current,
      [fieldId]: value,
    }));
    setSaveMessage("");
    setSaveError("");
  }

  function updateStoreField(field: keyof StoreFormValues, value: string) {
    setStoreValues((current) => ({
      ...current,
      [field]: value,
    }));
    setStoreSaveMessage("");
    setStoreError("");
  }

  function handleBackToStoreList() {
    setSelectedStore(null);
    setStoreValues(emptyStoreFormValues);
    setStoreSaveMessage("");
    setStoreError("");
  }

  async function handleSaveStore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedStore) return;

    const name = storeValues.name.trim();
    if (!name) {
      setStoreError("가게 이름을 입력해주세요.");
      setStoreSaveMessage("");
      return;
    }

    const payload: StoreUpdateRequest = {};
    appendChangedValue(payload, "name", name, selectedStore.name);
    appendChangedValue(payload, "category", storeValues.category, selectedStore.category);
    appendChangedValue(
      payload,
      "description",
      toNullableValue(storeValues.description),
      selectedStore.description,
    );
    appendChangedValue(
      payload,
      "operatingHours",
      toNullableValue(storeValues.operatingHours),
      selectedStore.operatingHours,
    );
    appendChangedValue(payload, "contact", toNullableValue(storeValues.contact), selectedStore.contact);
    appendChangedValue(
      payload,
      "yearsOfOperation",
      toNullableValue(storeValues.yearsOfOperation),
      selectedStore.yearsOfOperation,
    );
    appendChangedValue(payload, "items", toNullableValue(storeValues.items), selectedStore.items);

    if (Object.keys(payload).length === 0) {
      setStoreError("수정할 내용을 입력해주세요.");
      setStoreSaveMessage("");
      return;
    }

    setIsSavingStore(true);
    setStoreError("");
    setStoreSaveMessage("");

    try {
      const updatedStore = await updateStore(selectedStore.storeId, payload);
      setSelectedStore(updatedStore);
      setStoreValues(getStoreValues(updatedStore));
      setStores((currentStores) =>
        currentStores.map((store) =>
          store.storeId === updatedStore.storeId ? { ...store, ...updatedStore } : store,
        ),
      );
      setStoreSaveMessage("가게 정보를 저장했어요.");
    } catch (error) {
      setStoreError(error instanceof Error ? error.message : "가게 정보 저장에 실패했습니다.");
    } finally {
      setIsSavingStore(false);
    }
  }

  async function handleSaveMarketText(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = marketFields.reduce<UpdateMarketPageTextRequest>((result, field) => {
      const apiField = apiFieldByFieldId[field.id];
      const value = marketValues[field.id]?.trim();

      if (apiField && value) {
        result[apiField] = value;
      }

      return result;
    }, {});

    if (Object.keys(payload).length === 0) {
      setSaveError("수정할 내용을 입력해주세요.");
      setSaveMessage("");
      return;
    }

    setIsSaving(true);
    setSaveError("");
    setSaveMessage("");

    try {
      await updateMarketPageText(payload);
      setSaveMessage("수정한 문구를 저장했어요.");
    } catch (error) {
      const apiError = error as Partial<MarketPageApiError>;
      setSaveError(apiError.message ?? "문구 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className={styles.page}>
      <Header variant="builder" />
      <div className={styles.backgroundMark} aria-hidden="true">
        <Image
          alt=""
          fill
          priority
          sizes="80vw"
          src="/images/onboarding/generating-background.png"
        />
      </div>

      <section className={styles.titleBlock}>
        <h1>웹사이트 상세 정보 수정하기</h1>
        <p>웹페이지 상세 정보 수정 방법은 ‘사용방법&apos; 탭에서 확인하실 수 있습니다.</p>
      </section>

      <section className={`${styles.panel} ${styles.editPanel}`} aria-label="웹사이트 상세 정보 수정">
        <div className={styles.tabs} role="tablist" aria-label="수정 항목">
          <button
            className={`${styles.tab} ${tab === "market" ? styles.activeTab : ""}`}
            type="button"
            role="tab"
            aria-selected={tab === "market"}
            onClick={() => setTab("market")}
          >
            시장 정보 수정
          </button>
          <button
            className={`${styles.tab} ${tab === "store" ? styles.activeTab : ""}`}
            type="button"
            role="tab"
            aria-selected={tab === "store"}
            onClick={() => setTab("store")}
          >
            가게 정보 수정
          </button>
        </div>

        {tab === "market" ? (
          <form className={styles.form} onSubmit={handleSaveMarketText}>
            {isLoadingContent ? (
              <p className={styles.formMessage}>기존 내용을 불러오는 중입니다.</p>
            ) : null}
            {contentError ? <p className={styles.formError}>{contentError}</p> : null}
            {marketFields.map((field) => (
              <div className={styles.field} key={`${templateType}-${field.id}`}>
                <label htmlFor={`${templateType}-${field.id}`}>{field.label}</label>
                {field.rows === 1 ? (
                  <input
                    id={`${templateType}-${field.id}`}
                    maxLength={getFieldMaxLength(apiFieldByFieldId[field.id])}
                    placeholder={field.placeholder}
                    value={marketValues[field.id] ?? ""}
                    onChange={(event) => updateFieldValue(field.id, event.target.value)}
                  />
                ) : (
                  <textarea
                    id={`${templateType}-${field.id}`}
                    maxLength={getFieldMaxLength(apiFieldByFieldId[field.id])}
                    placeholder={field.placeholder}
                    rows={field.rows}
                    value={marketValues[field.id] ?? ""}
                    onChange={(event) => updateFieldValue(field.id, event.target.value)}
                  />
                )}
              </div>
            ))}
            {saveError ? <p className={styles.formError}>{saveError}</p> : null}
            {saveMessage ? <p className={styles.formMessage}>{saveMessage}</p> : null}
            <button className={styles.saveButton} type="submit" disabled={isSaving}>
              {isSaving ? "저장 중" : "저장하기"}
            </button>
          </form>
        ) : (
          <section className={styles.storeEditor} aria-label="가게 정보 수정">
            {isLoadingStores ? <p className={styles.formMessage}>점포 목록을 불러오는 중입니다.</p> : null}
            {storeError ? <p className={styles.formError}>{storeError}</p> : null}
            {!isLoadingStores && stores.length === 0 ? (
              <div className={styles.storePlaceholder}>등록된 점포가 없습니다.</div>
            ) : selectedStore ? (
              <form
                className={`${styles.storeForm} ${
                  templateType === "TEMPLATE_1" ? styles.storeFormTemplateOne : ""
                }`}
                onSubmit={handleSaveStore}
              >
                <button
                  className={styles.storeBackButton}
                  type="button"
                  aria-label="점포 목록으로 돌아가기"
                  onClick={handleBackToStoreList}
                />
                <h2 className={styles.storeFormTitle}>{selectedStore.name}</h2>
                <div className={styles.storeFormFields}>
                  <label className={styles.storeFormField}>
                    <span>가게 이름 수정하기</span>
                    <input
                      maxLength={100}
                      placeholder="(기존 가게 이름)"
                      value={storeValues.name}
                      onChange={(event) => updateStoreField("name", event.target.value)}
                    />
                  </label>
                  <label className={styles.storeFormField}>
                    <span>가게 카테고리 수정하기</span>
                    <select
                      value={storeValues.category}
                      onChange={(event) => updateStoreField("category", event.target.value)}
                    >
                      {storeCategories
                        .filter((category) => category !== "전체보기")
                        .map((category) => (
                          <option key={category} value={category}>
                            {category === "농수산물" ? "농/수산물" : category}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label className={styles.storeFormField}>
                    <span>1. 가게 한 줄 소개 수정하기(50자 이내)</span>
                    <input
                      maxLength={200}
                      placeholder="(기존 한 줄 소개 내용)"
                      value={storeValues.description}
                      onChange={(event) => updateStoreField("description", event.target.value)}
                    />
                  </label>
                  <label className={styles.storeFormField}>
                    <span>2. 가게 영업 시간 수정하기(50자 이내)</span>
                    <input
                      maxLength={50}
                      placeholder="예) 평일 09:00~18:00 / 주말 10:00~17:00"
                      value={storeValues.operatingHours}
                      onChange={(event) => updateStoreField("operatingHours", event.target.value)}
                    />
                  </label>
                  <label className={styles.storeFormField}>
                    <span>3. 가게 전화번호 수정하기</span>
                    <input
                      maxLength={20}
                      placeholder="(기존 전화번호 내용)"
                      value={storeValues.contact}
                      onChange={(event) => updateStoreField("contact", event.target.value)}
                    />
                  </label>
                  <label className={styles.storeFormField}>
                    <span>4. 가게 위치 수정하기</span>
                    <input
                      maxLength={20}
                      placeholder="(기존 위치 내용)"
                      value={storeValues.yearsOfOperation}
                      onChange={(event) => updateStoreField("yearsOfOperation", event.target.value)}
                    />
                  </label>
                  <label className={styles.storeFormField}>
                    <span>5. 가게 대표 음식 수정하기</span>
                    <input
                      maxLength={255}
                      placeholder="(기존 대표 음식 내용)"
                      value={storeValues.items}
                      onChange={(event) => updateStoreField("items", event.target.value)}
                    />
                  </label>
                  {templateType === "TEMPLATE_1" ? (
                    <label className={`${styles.storeFormField} ${styles.storeFormTextareaField}`}>
                      <span>6. 가게 대표 음식 소개 수정하기(200자 이내)</span>
                      <textarea
                        maxLength={200}
                        placeholder="(기존 대표 음식 소개 내용)"
                        value={storeValues.description}
                        onChange={(event) => updateStoreField("description", event.target.value)}
                      />
                    </label>
                  ) : null}
                </div>
                {storeSaveMessage ? <p className={styles.formMessage}>{storeSaveMessage}</p> : null}
                <button className={styles.saveButton} type="submit" disabled={isSavingStore}>
                  {isSavingStore ? "저장 중" : "저장하기"}
                </button>
              </form>
            ) : (
              <>
                <label className={styles.storeSearch} aria-label="점포 검색">
                  <input
                    placeholder="원하는 매장을 검색해보세요"
                    value={storeSearch}
                    onChange={(event) => setStoreSearch(event.target.value)}
                  />
                </label>
                <div className={styles.storeCategoryFilter} aria-label="카테고리">
                  {storeCategories.map((category) => (
                    <button
                      className={`${styles.categoryChip} ${
                        storeCategory === category ? styles.activeCategoryChip : ""
                      }`}
                      key={category}
                      type="button"
                      onClick={() => setStoreCategory(category)}
                    >
                      {category === "농수산물" ? "농/수산물" : category}
                    </button>
                  ))}
                </div>
                {isLoadingStoreDetail ? (
                  <p className={styles.formMessage}>점포 상세 정보를 불러오는 중입니다.</p>
                ) : null}
                <div className={styles.storeCardGrid} aria-label="점포 목록">
                  {filteredStores.map((store) => (
                    <button
                      className={styles.storeListItem}
                      key={store.storeId}
                      type="button"
                      onClick={() => handleSelectStore(store.storeId)}
                    >
                      <strong>{store.category === "농수산물" ? "농/수산물" : store.category}</strong>
                      <span>{store.name}</span>
                    </button>
                  ))}
                  {filteredStores.length === 0 ? (
                    <p className={styles.storeDetailEmpty}>검색 결과가 없습니다.</p>
                  ) : null}
                </div>
              </>
            )}
          </section>
        )}
      </section>
    </main>
  );
}

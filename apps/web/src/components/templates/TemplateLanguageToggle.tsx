"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

export type TemplateLanguage = "ko" | "en";

const STORAGE_KEY = "digi-mon-template-language";
const LANGUAGE_EVENT = "digi-mon-template-language-change";
const GOOGLE_TRANSLATE_ELEMENT_ID = "google_translate_element";
const GOOGLE_TRANSLATE_SCRIPT_ID = "google-translate-script";

interface GoogleTranslateElementConstructor {
  new (
    options: {
      autoDisplay: boolean;
      includedLanguages: string;
      pageLanguage: string;
    },
    elementId: string,
  ): unknown;
}

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement?: GoogleTranslateElementConstructor;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

const translations = {
  marketIntro: { ko: "시장소개", en: "About" },
  marketIntroSpaced: { ko: "시장 소개", en: "About" },
  storeInfo: { ko: "가게정보", en: "Stores" },
  storeGuide: { ko: "점포 안내", en: "Stores" },
  shopGuide: { ko: "가게안내", en: "Stores" },
  tourInfo: { ko: "관광정보", en: "Tour" },
  tourInfoSpaced: { ko: "관광 정보", en: "Tour" },
  openingSoon: { ko: "오픈 예정", en: "Coming Soon" },
  information: { ko: "정보 안내", en: "Information" },
  directions: { ko: "찾아오시는 길", en: "Directions" },
  address: { ko: "주소", en: "Address" },
  contact: { ko: "문의", en: "Contact" },
  email: { ko: "이메일", en: "Email" },
  category: { ko: "카테고리", en: "Category" },
  all: { ko: "전체", en: "All" },
  searchStore: { ko: "원하는 매장을 검색해보세요", en: "Search stores" },
  searchStoreName: {
    ko: "찾고싶은 가게 이름을 입력하세요",
    en: "Enter a store name",
  },
  findStorePoint: { ko: "점포 찾기", en: "Find a Store" },
  categoryDescription: {
    ko: "카테고리를 선택하시면 해당하는 가게를 확인하실 수 있습니다.",
    en: "Select a category to browse stores.",
  },
  findStore: { ko: "가게 찾기", en: "Find a Store" },
  findStoreDescription: {
    ko: "가게들을 카테고리 별로 확인해보세요",
    en: "Browse stores by category",
  },
  businessHours: { ko: "영업시간", en: "Hours" },
  storeContact: { ko: "가게 연락처", en: "Phone" },
  mainMenu: { ko: "주요 메뉴", en: "Featured Items" },
  storeIntro: { ko: "가게 한줄 소개", en: "Store Introduction" },
  storePhone: { ko: "가게 전화번호", en: "Phone" },
  menuBoard: { ko: "가게 메뉴판 보기", en: "Menu" },
  featuredFood: { ko: "가게 대표 음식 보기", en: "Featured Products" },
  featuredFoodShort: { ko: "대표 음식", en: "Featured Products" },
  storeLocation: { ko: "가게 위치", en: "Location" },
  fastestRoute: { ko: "빨리오시는 길", en: "Quick Route" },
  parking: { ko: "주차 안내", en: "Parking" },
} as const;

export type TemplateTranslationKey = keyof typeof translations;

function subscribeToLanguageChanges(callback: () => void) {
  window.addEventListener(LANGUAGE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(LANGUAGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getLanguageSnapshot(): TemplateLanguage {
  const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
  return savedLanguage === "en" ? "en" : "ko";
}

function getServerLanguageSnapshot(): TemplateLanguage {
  return "ko";
}

function applyGoogleTranslateLanguage(
  language: TemplateLanguage,
  remainingAttempts = 20,
) {
  const languageSelect = document.querySelector<HTMLSelectElement>(".goog-te-combo");

  if (!languageSelect) {
    if (remainingAttempts > 0) {
      window.setTimeout(
        () => applyGoogleTranslateLanguage(language, remainingAttempts - 1),
        150,
      );
    }
    return;
  }

  if (languageSelect.value === language) return;

  languageSelect.value = language;
  languageSelect.dispatchEvent(new Event("change", { bubbles: true }));
}

function initializeGoogleTranslate() {
  const TranslateElement = window.google?.translate?.TranslateElement;
  const container = document.getElementById(GOOGLE_TRANSLATE_ELEMENT_ID);

  if (!TranslateElement || !container || container.childElementCount > 0) {
    return;
  }

  new TranslateElement(
    {
      autoDisplay: false,
      includedLanguages: "ko,en",
      pageLanguage: "ko",
    },
    GOOGLE_TRANSLATE_ELEMENT_ID,
  );

  applyGoogleTranslateLanguage(getLanguageSnapshot());
}

export function useTemplateLanguage(): {
  language: TemplateLanguage;
  t: (key: TemplateTranslationKey) => string;
  toggleLanguage: () => void;
} {
  const language = useSyncExternalStore(
    subscribeToLanguageChanges,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );

  const changeLanguage = useCallback((nextLanguage: TemplateLanguage) => {
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    window.dispatchEvent(
      new CustomEvent<TemplateLanguage>(LANGUAGE_EVENT, {
        detail: nextLanguage,
      }),
    );
  }, []);

  const toggleLanguage = useCallback(() => {
    changeLanguage(language === "ko" ? "en" : "ko");
  }, [changeLanguage, language]);

  const t = useCallback(
    (key: TemplateTranslationKey) => translations[key][language],
    [language],
  );

  return { language, t, toggleLanguage };
}

export function translateStoreCategory(
  category: string,
  language: TemplateLanguage,
): string {
  if (language === "ko") return category;

  const categoryTranslations: Record<string, string> = {
    전체: "All",
    "농/수산물": "Produce & Seafood",
    농수산물: "Produce & Seafood",
    먹거리: "Food",
    의류: "Clothing",
    생활용품: "Household",
    기타: "Other",
  };

  return categoryTranslations[category] ?? category;
}

export function TemplateTourComingSoon({
  spaced = false,
}: {
  spaced?: boolean;
}) {
  const { t } = useTemplateLanguage();

  return (
    <span
      aria-disabled="true"
      title={t("openingSoon")}
      style={{
        color: "inherit",
        cursor: "default",
        font: "inherit",
        opacity: 0.58,
        textDecoration: "none",
        whiteSpace: "nowrap",
      }}
    >
      {t(spaced ? "tourInfoSpaced" : "tourInfo")} ({t("openingSoon")})
    </span>
  );
}

export default function TemplateLanguageToggle() {
  const { language, toggleLanguage } = useTemplateLanguage();

  useEffect(() => {
    window.googleTranslateElementInit = initializeGoogleTranslate;

    if (window.google?.translate?.TranslateElement) {
      initializeGoogleTranslate();
      return;
    }

    const existingScript = document.getElementById(
      GOOGLE_TRANSLATE_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", initializeGoogleTranslate);
      return () => {
        existingScript.removeEventListener("load", initializeGoogleTranslate);
      };
    }

    const script = document.createElement("script");
    script.id = GOOGLE_TRANSLATE_SCRIPT_ID;
    script.async = true;
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.head.appendChild(script);
  }, []);

  const handleToggle = useCallback(() => {
    const nextLanguage = language === "ko" ? "en" : "ko";
    toggleLanguage();
    applyGoogleTranslateLanguage(nextLanguage);
  }, [language, toggleLanguage]);

  return (
    <>
      <button
        aria-label={language === "ko" ? "Switch to English" : "한국어로 전환"}
        className="skiptranslate"
        onClick={handleToggle}
        style={{
          appearance: "none",
          background: "none",
          border: 0,
          color: "inherit",
          cursor: "pointer",
          font: "inherit",
          padding: 0,
        }}
        translate="no"
        type="button"
      >
        EN / KR
      </button>
      <span
        aria-hidden="true"
        className="skiptranslate"
        id={GOOGLE_TRANSLATE_ELEMENT_ID}
        style={{
          height: 1,
          left: -9999,
          overflow: "hidden",
          position: "fixed",
          top: 0,
          width: 1,
        }}
        translate="no"
      />
    </>
  );
}

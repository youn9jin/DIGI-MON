"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type DragEvent, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Header from "@/components/layout/Header";
import {
  saveMarketPageSetup,
  type MarketPageSection,
  type TemplateType,
} from "@/lib/api/market-page";
import { createStores, type StoreCreateItem } from "@/lib/api/stores";
import { uploadMarketPageImage } from "@/lib/firebase-storage";
import styles from "./template-info.module.css";

const backgroundImage = "/images/onboarding/market-illustration.png";

const textFields = [
  {
    id: "intro" as const,
    title: "시장 한 줄 소개 작성하기(50자 이내)",
    placeholder: "시장 소개를 작성해주세요.",
    rows: 4,
  },
  {
    id: "history" as const,
    title: "시장 대표 소개글 작성하기(1000자 이내)",
    placeholder: "시장의 자랑거리, 역사 등 시장에 관련된 내용을 작성해주세요.",
    rows: 4,
  },
  {
    id: "directions" as const,
    title: "시장 찾아오는 길 및 주차 안내 작성하기(300자 이내)",
    placeholder:
      "지도에서 제공하는 내용보다 더 쉬운 길찾기 방법이 있다면 알려주세요. 예) 충무로역 6번 출구에서 직진한 후 메가커피 골목으로 들어오면 시장 주 출입구가 있습니다, 주차장은 충무로역 공영주차장 이용이 가능합니다.",
    rows: 4,
  },
];

const setupStorageKey = "market_page_setup_draft";
const generatedPageIdStorageKey = "generated_market_page_id";
const generationVersionStorageKey = "market_page_generation_version";
const generationInProgressStorageKey = "market_page_generation_in_progress";

type PreviewTarget = "intro" | "history" | "stores";

interface PreviewConfig {
  title: string;
  modalClassName?: string;
  canvasClassName: string;
  images: {
    alt: string;
    className: string;
    imageClassName?: string;
    sizes: string;
    src: string;
  }[];
  highlights?: string[];
  instruction?: string;
  instructionClassName?: string;
}

interface SetupDraft {
  templateType: TemplateType;
  selectedSections: MarketPageSection[];
}

type StoreExcelField = Exclude<
  keyof StoreCreateItem,
  "storeImageUrls" | "menuImageUrls" | "productImageUrls"
>;

const storeHeaderMap: Record<StoreExcelField, string[]> = {
  name: ["name", "점포명", "가게명", "상호명", "상호"],
  category: ["category", "업종", "카테고리", "분류"],
  items: ["items", "취급품목", "취급 품목", "대표메뉴", "대표 메뉴", "품목"],
  operatingHours: ["operating_hours", "operatingHours", "영업시간", "운영시간", "운영 시간"],
  yearsOfOperation: ["years_of_operation", "yearsOfOperation", "운영연수", "운영 연수"],
  contact: ["contact", "연락처", "전화번호", "대표 연락처"],
  description: ["description", "점포소개", "점포 소개", "소개"],
};

const previewConfigs: Record<TemplateType, Record<PreviewTarget, PreviewConfig>> = {
  TEMPLATE_1: {
    intro: {
      title: "미리보기",
      canvasClassName: styles.previewCanvasTemplate3Intro,
      images: [
        {
          alt: "시장 소개 글 위치 미리보기",
          className: styles.previewImageFill,
          sizes: "900px",
          src: "/images/templates/info-preview/template3-intro-preview.png",
        },
      ],
      highlights: [styles.template3IntroHighlight],
      instruction: "흰색 박스 안 부분에 해당하는 소개를 작성해주시면 됩니다",
      instructionClassName: styles.previewInstructionDark,
    },
    history: {
      title: "미리보기",
      canvasClassName: styles.previewCanvasTemplate3History,
      images: [
        {
          alt: "시장 역사 글 위치 미리보기",
          className: styles.previewImageFill,
          sizes: "720px",
          src: "/images/templates/info-preview/template3-history-preview.png",
        },
      ],
      highlights: [styles.template3HistoryHighlightTop, styles.template3HistoryHighlightBottom],
      instruction: "검정색 박스 안 부분에 해당하는 소개를 작성해주시면 됩니다",
      instructionClassName: styles.previewInstructionMiddle,
    },
    stores: {
      title: "미리보기",
      modalClassName: styles.previewModalTall,
      canvasClassName: styles.previewCanvasTemplate3Stores,
      images: [
        {
          alt: "점포 검색 페이지 미리보기",
          className: styles.template3StorePreviewLeft,
          sizes: "470px",
          src: "/images/templates/info-preview/template1-stores-preview-left.png",
        },
        {
          alt: "점포 상세 페이지 미리보기",
          className: styles.template3StorePreviewRight,
          sizes: "462px",
          src: "/images/templates/info-preview/template1-stores-preview-right.png",
        },
      ],
    },
  },
  TEMPLATE_2: {
    intro: {
      title: "미리보기",
      canvasClassName: styles.previewCanvasTemplate2Intro,
      images: [
        {
          alt: "시장 소개 글 위치 미리보기",
          className: styles.previewImageFill,
          imageClassName: styles.template2IntroImage,
          sizes: "840px",
          src: "/images/templates/info-preview/template2-intro-preview.png",
        },
      ],
      highlights: [styles.template2IntroHighlight],
      instruction: "초록색 박스 안 부분에 해당하는 소개를 작성해주시면 됩니다",
      instructionClassName: styles.previewInstructionLight,
    },
    history: {
      title: "미리보기",
      canvasClassName: styles.previewCanvasTemplate2History,
      images: [
        {
          alt: "시장 역사 글 위치 미리보기",
          className: styles.previewImageFill,
          imageClassName: styles.template2HistoryImage,
          sizes: "840px",
          src: "/images/templates/info-preview/template2-history-preview.png",
        },
      ],
      highlights: [styles.template2HistoryHighlightTop, styles.template2HistoryHighlightBottom],
      instruction: "초록색 박스 안 부분에 해당하는 소개를 작성해주시면 됩니다",
      instructionClassName: styles.previewInstructionLight,
    },
    stores: {
      title: "미리보기",
      canvasClassName: styles.previewCanvasTemplate2Stores,
      images: [
        {
          alt: "점포 검색 페이지 미리보기",
          className: styles.template2StorePreviewLeft,
          sizes: "470px",
          src: "/images/templates/info-preview/template2-stores-preview-left.png",
        },
        {
          alt: "점포 상세 페이지 미리보기",
          className: styles.template2StorePreviewRight,
          sizes: "462px",
          src: "/images/templates/info-preview/template2-stores-preview-right.png",
        },
      ],
    },
  },
  TEMPLATE_3: {
    intro: {
      title: "미리보기",
      canvasClassName: styles.previewCanvasTemplate1Intro,
      images: [
        {
          alt: "시장 소개 글 위치 미리보기",
          className: styles.previewImageFill,
          sizes: "900px",
          src: "/images/templates/info-preview/template1-intro-preview.png",
        },
      ],
      highlights: [styles.template1IntroHighlight],
      instruction: "검정색 박스 안 부분에 해당하는 소개를 작성해주시면 됩니다",
      instructionClassName: styles.previewInstructionDark,
    },
    history: {
      title: "미리보기",
      canvasClassName: styles.previewCanvasTemplate1History,
      images: [
        {
          alt: "시장 역사 글 위치 미리보기",
          className: styles.previewImageFill,
          sizes: "720px",
          src: "/images/templates/info-preview/template1-history-preview.png",
        },
      ],
      highlights: [styles.template1HistoryHighlightMain, styles.template1HistoryHighlightSide],
      instruction: "검정색 박스 안 부분에 해당하는 소개를 작성해주시면 됩니다",
      instructionClassName: styles.previewInstructionDark,
    },
    stores: {
      title: "미리보기",
      canvasClassName: styles.previewCanvasTemplate1Stores,
      images: [
        {
          alt: "점포 검색 페이지 미리보기",
          className: styles.template1StorePreviewLeft,
          sizes: "470px",
          src: "/images/templates/info-preview/template1-stores-preview-left.png",
        },
        {
          alt: "점포 상세 페이지 미리보기",
          className: styles.template1StorePreviewRight,
          sizes: "462px",
          src: "/images/templates/info-preview/template1-stores-preview-right.png",
        },
      ],
    },
  },
};

function getTemplateType(value: string | null): TemplateType {
  if (value === "TEMPLATE_1" || value === "TEMPLATE_2" || value === "TEMPLATE_3") {
    return value;
  }

  return "TEMPLATE_1";
}

function getSetupDraft(): SetupDraft {
  if (typeof window === "undefined") {
    return {
      templateType: "TEMPLATE_1",
      selectedSections: ["intro", "history", "directions", "stores", "tourism"],
    };
  }

  const queryTemplate = new URLSearchParams(window.location.search).get("template");
  const templateTypeFromQuery = queryTemplate ? getTemplateType(queryTemplate) : null;
  const stored = window.sessionStorage.getItem(setupStorageKey);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Partial<SetupDraft>;
      if (parsed.templateType && parsed.selectedSections?.length) {
        return {
          templateType: templateTypeFromQuery ?? getTemplateType(parsed.templateType),
          selectedSections: parsed.selectedSections,
        };
      }
    } catch {
      window.sessionStorage.removeItem(setupStorageKey);
    }
  }

  return {
    templateType: templateTypeFromQuery ?? "TEMPLATE_1",
    selectedSections: ["intro", "history", "directions", "stores", "tourism"],
  };
}

function getPreviewConfig(_templateType: TemplateType, target: PreviewTarget): PreviewConfig {
  return previewConfigs[_templateType][target];
}

function normalizeHeader(value: string): string {
  return value.toLowerCase().replace(/[\s_/-]/g, "");
}

function normalizeCategory(value: string): string {
  const normalized = value.trim().replace(/[\s/]/g, "");

  if (["농수산물", "농수산", "농산물", "수산물"].includes(normalized)) {
    return "농수산물";
  }
  if (["먹거리", "먹을거리", "음식", "식품"].includes(normalized)) {
    return "먹거리";
  }
  if (["의류", "옷", "패션"].includes(normalized)) {
    return "의류";
  }
  if (normalized === "생활용품") {
    return "생활용품";
  }
  if (normalized === "기타") {
    return "기타";
  }

  return "기타";
}

function normalizeContact(value: string): string {
  return value.replace(/[^\d+\-()\s]/g, "").trim();
}

function getSaveErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (
    message.includes("storage/unauthorized") ||
    message.includes("403") ||
    message.includes("permission") ||
    message.includes("Permission")
  ) {
    return "이미지 업로드 권한이 없습니다. Firebase Storage Rules에서 로그인 사용자의 market-page 경로 쓰기 권한을 확인해주세요.";
  }

  if (
    message.includes("CORS")
  ) {
    return "이미지 업로드에 실패했습니다. Firebase Storage CORS 설정을 확인해주세요.";
  }

  if (message.includes("storage") || message.includes("Firebase")) {
    return "이미지 업로드에 실패했습니다. Firebase Storage 설정을 확인해주세요.";
  }

  return message || "웹페이지 생성 설정 저장에 실패했습니다.";
}

function getCell(row: Record<string, unknown>, field: StoreExcelField): string {
  const aliases = storeHeaderMap[field].map(normalizeHeader);
  const entry = Object.entries(row).find(([key]) => aliases.includes(normalizeHeader(key)));
  const value = entry?.[1];
  return value == null ? "" : String(value).trim();
}

async function parseStoreSheet(file: File): Promise<StoreCreateItem[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = firstSheetName ? workbook.Sheets[firstSheetName] : undefined;
  if (!worksheet) return [];

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: "",
    range: 0,
    raw: false,
  });

  return rows.flatMap((row) => {
    const store: StoreCreateItem = {
      name: getCell(row, "name"),
      category: getCell(row, "category"),
      items: getCell(row, "items"),
      operatingHours: getCell(row, "operatingHours"),
      yearsOfOperation: getCell(row, "yearsOfOperation"),
      contact: normalizeContact(getCell(row, "contact")),
      description: getCell(row, "description"),
    };

    const hasContent = Object.values(store).some((value) => value.length > 0);
    if (!hasContent) return [];

    return [
      {
        ...store,
        category: normalizeCategory(store.category),
      },
    ];
  });
}

export default function TemplateInfoPage() {
  const router = useRouter();
  const [setupDraft] = useState<SetupDraft>(getSetupDraft);
  const [marketContent, setMarketContent] = useState({
    introText: "",
    historyText: "",
    directionsText: "",
  });
  const [previewTarget, setPreviewTarget] = useState<PreviewTarget | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoFileName, setLogoFileName] = useState("");
  const [representativeFiles, setRepresentativeFiles] = useState<File[]>([]);
  const [representativeFileMessage, setRepresentativeFileMessage] = useState("");
  const [storeFileName, setStoreFileName] = useState("");
  const [storeUploadMessage, setStoreUploadMessage] = useState("");
  const [saveErrorMessage, setSaveErrorMessage] = useState("");
  const [stores, setStores] = useState<StoreCreateItem[]>([]);
  const needsStoreFile = setupDraft.selectedSections.includes("stores");
  const previewConfig = previewTarget
    ? getPreviewConfig(setupDraft.templateType, previewTarget)
    : null;
  const isInfoComplete =
    marketContent.introText.trim().length > 0 &&
    marketContent.historyText.trim().length > 0 &&
    marketContent.directionsText.trim().length > 0 &&
    logoFile != null &&
    representativeFiles.length > 0 &&
    (!needsStoreFile || stores.length > 0);

  useEffect(() => {
    if (!previewTarget) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [previewTarget]);

  async function handleStoreFileChange(file: File | undefined) {
    setStoreUploadMessage("");
    setStores([]);

    if (!file) {
      setStoreFileName("");
      return;
    }

    setStoreFileName(file.name);
    try {
      const parsedStores = await parseStoreSheet(file);
      if (parsedStores.length === 0) {
        setStoreUploadMessage("읽을 수 있는 점포 정보가 없습니다.");
        return;
      }
      setStores(parsedStores);
      setStoreUploadMessage(`${parsedStores.length}개 점포 정보를 읽었어요.`);
    } catch {
      setStoreUploadMessage("파일을 읽지 못했습니다. xlsx 또는 csv 파일인지 확인해주세요.");
    }
  }

  function handleLogoFileChange(file: File | undefined) {
    if (!file) {
      setLogoFile(null);
      setLogoFileName("");
      return;
    }

    setLogoFile(file);
    setLogoFileName(file.name);
  }

  function handleRepresentativeFilesChange(fileList: FileList | null) {
    const files = Array.from(fileList ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );
    setRepresentativeFiles(files);

    if (files.length === 0) {
      setRepresentativeFileMessage("");
      return;
    }

    setRepresentativeFileMessage(
      `${files.length}개 사진을 선택했어요. 템플릿에는 앞의 사진부터 우선 표시됩니다.`,
    );
  }

  function handleLogoDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    handleLogoFileChange(event.dataTransfer.files[0]);
  }

  function handleRepresentativeDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    handleRepresentativeFilesChange(event.dataTransfer.files);
  }

  async function handleInfoComplete() {
    if (isSaving || !isInfoComplete) return;

    setIsSaving(true);
    setSaveErrorMessage("");
    try {
      if (stores.length > 0) {
        const result = await createStores(stores);
        if (result.failedItems?.length > 0) {
          const firstFailed = result.failedItems[0];
          setSaveErrorMessage(
            `${result.successCount}개 등록, ${result.failedItems.length}개 실패했습니다.\n${firstFailed.name ?? "점포"}: ${firstFailed.reason}`,
          );
          setIsSaving(false);
          return;
        }
      }

      const [logoImageUrl, ...uploadedIntroImageUrls] = await Promise.all([
        logoFile ? uploadMarketPageImage(logoFile, "logo") : Promise.resolve(null),
        ...representativeFiles.map((file) => uploadMarketPageImage(file, "intro")),
      ]);
      const introImageUrls = uploadedIntroImageUrls.filter(
        (url): url is string => Boolean(url),
      );
      const heroImageUrl = introImageUrls[0] ?? null;

      await saveMarketPageSetup({
        templateType: setupDraft.templateType,
        selectedSections: setupDraft.selectedSections,
        marketContent,
        heroImageUrl,
        logoImageUrl,
        introImageUrls,
      });
      window.sessionStorage.removeItem(generatedPageIdStorageKey);
      window.sessionStorage.removeItem("generated_market_public_market_id");
      window.sessionStorage.setItem(generationVersionStorageKey, String(Date.now()));
      window.sessionStorage.setItem(generationInProgressStorageKey, "true");
      router.push("/templates/generating");
    } catch (error) {
      setSaveErrorMessage(getSaveErrorMessage(error));
      setIsSaving(false);
    }
  }

  return (
    <main className={styles.page}>
      <Header variant="builder" />

      <div className={styles.backgroundMark} aria-hidden="true">
        <Image alt="" fill priority sizes="80vw" src={backgroundImage} />
      </div>

      <section className={styles.hero}>
        <h1>우리 시장 정보 입력</h1>
        <p>우리 시장만의 웹사이트를 만들기 위해서는 시장 소개, 입점 점포 정보 정보 등을 입력해주셔야해요.</p>
        <span>‘마이페이지 → 웹사이트 정보 수정하기&apos;에서 언제든지 수정 가능해요.</span>
      </section>

      <section className={styles.panel} aria-label="시장 정보 입력">
        <header className={styles.stepHeader}>
          <h2>3단계 - 시장 정보 입력하기</h2>
          <p>웹사이트를 완성하기 위해 정보를 작성해주세요. 글 작성은 AI의 도움을 받을 수 있습니다.</p>
        </header>

        <form className={styles.form}>
          {textFields.map((field, index) => (
            <section className={styles.fieldGroup} key={field.id}>
              <div className={styles.fieldTitleRow}>
                <h3>
                  {index + 1}. {field.title}
                </h3>
                {field.id !== "directions" && (
                  <button type="button" onClick={() => setPreviewTarget(field.id)}>
                    글 위치 확인하기
                  </button>
                )}
              </div>
              <textarea
                aria-label={field.title}
                placeholder={field.placeholder}
                rows={field.rows}
                value={
                  field.id === "intro"
                    ? marketContent.introText
                    : field.id === "history"
                      ? marketContent.historyText
                      : marketContent.directionsText
                }
                onChange={(event) => {
                  const value = event.target.value;
                  setMarketContent((current) => {
                    if (field.id === "intro") return { ...current, introText: value };
                    if (field.id === "history") return { ...current, historyText: value };
                    return { ...current, directionsText: value };
                  });
                }}
              />
              <button className={styles.aiButton} type="button">
                AI 도움받기
              </button>
              {field.id === "intro" && (
                <section className={styles.inlineUploadGroup}>
                  <div className={styles.inlineUploadTitle}>
                    <h3>1-1. 시장 로고 등록하기</h3>
                    <p>시장 로고를 png 파일로 업로드해주세요.</p>
                  </div>
                  <div
                    className={styles.imageDropZone}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={handleLogoDrop}
                  >
                    <span>{logoFileName || "시장 로고를 마우스로 끌어와주세요"}</span>
                  </div>
                  <label className={styles.imageFileButton}>
                    파일 추가하기
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) => handleLogoFileChange(event.target.files?.[0])}
                    />
                  </label>
                </section>
              )}
              {field.id === "history" && (
                <section className={styles.inlineUploadGroup}>
                  <div className={styles.inlineUploadTitle}>
                    <h3>2-1. 시장 대표 사진 등록하기</h3>
                    <p>시장 사진을 png 파일로 업로드해주세요. 4개 이상의 사진이 필요해요.</p>
                  </div>
                  <div
                    className={styles.imageDropZone}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={handleRepresentativeDrop}
                  >
                    <span>
                      {representativeFiles.length > 0
                        ? `${representativeFiles.length}개 사진 선택됨`
                        : "시장 대표 사진을 마우스로 끌어와주세요"}
                    </span>
                  </div>
                  <label className={styles.imageFileButton}>
                    파일 추가하기
                    <input
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) =>
                        handleRepresentativeFilesChange(event.target.files)
                      }
                    />
                  </label>
                  {representativeFileMessage && (
                    <p className={styles.imageUploadMessage}>
                      {representativeFileMessage}
                    </p>
                  )}
                </section>
              )}
            </section>
          ))}

          <section className={styles.fieldGroup}>
            <div className={styles.fieldTitleRow}>
              <h3>4. 시장 점포 등록하기</h3>
              <button type="button" onClick={() => setPreviewTarget("stores")}>
                글 위치 확인하기
              </button>
            </div>
            <div className={styles.uploadGuide}>
              <p className={styles.uploadHint}>
                WithOn 공식 양식 파일을 사용해주세요. category는 농수산물/먹거리/의류/생활용품/기타 중 하나로 입력해야 하며, 해당하지 않는 경우 자동으로 기타로 분류됩니다.
              </p>
              <a
                className={styles.templateDownloadButton}
                href="/downloads/WithOn_점포등록_공식양식.xlsx"
                download="WithOn_점포등록_공식양식.xlsx"
              >
                양식 파일 다운로드
              </a>
            </div>
            <label className={styles.fileUpload}>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(event) => handleStoreFileChange(event.target.files?.[0])}
              />
              <span>{storeFileName || "파일 첨부"}</span>
            </label>
            {storeUploadMessage && (
              <p className={styles.storeUploadMessage}>{storeUploadMessage}</p>
            )}
          </section>
        </form>

        {saveErrorMessage && (
          <p className={styles.saveErrorMessage} role="status" aria-live="polite">
            {saveErrorMessage}
          </p>
        )}

        <div className={styles.actions}>
          <button
            className={styles.primaryAction}
            disabled={isSaving || !isInfoComplete}
            type="button"
            onClick={handleInfoComplete}
          >
            {isSaving ? "저장 중..." : "정보 입력 완료"}
          </button>
        </div>
      </section>

      {previewConfig && (
        <div className={styles.previewOverlay} role="dialog" aria-modal="true">
          <div
            className={`${styles.previewModal} ${previewConfig.modalClassName ?? ""}`}
          >
            <button
              className={styles.closePreview}
              type="button"
              aria-label="미리보기 닫기"
              onClick={() => setPreviewTarget(null)}
            />
            <h2>{previewConfig.title}</h2>
            <div className={`${styles.previewCanvas} ${previewConfig.canvasClassName}`}>
              {previewConfig.images.map((image) => (
                <span className={image.className} key={image.src}>
                  <Image
                    alt={image.alt}
                    className={image.imageClassName}
                    fill
                    sizes={image.sizes}
                    src={image.src}
                  />
                </span>
              ))}
              {previewConfig.highlights?.map((highlightClassName) => (
                <span
                  aria-hidden="true"
                  className={`${styles.highlightBox} ${highlightClassName}`}
                  key={highlightClassName}
                />
              ))}
            </div>
            {previewConfig.instruction && (
              <p className={previewConfig.instructionClassName ?? styles.previewInstructionDark}>
                {previewConfig.instruction}
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

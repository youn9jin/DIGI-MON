"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Header from "@/components/layout/Header";
import {
  createMarketPage,
  getMarketPageStatus,
  type MarketPageApiError,
  type TemplateType,
} from "@/lib/api/market-page";
import styles from "./templates.module.css";

const backgroundImage =
  "https://www.figma.com/api/mcp/asset/301564db-6807-4086-bf01-cc2b4bc2f3eb";
const templateImages: Record<TemplateType, string> = {
  TEMPLATE_3: "https://www.figma.com/api/mcp/asset/5200cb65-fb68-4917-a15e-8bc8523693ae",
  TEMPLATE_2: "https://www.figma.com/api/mcp/asset/51c33f53-4e69-41c6-a67b-2d251ba8c684",
  TEMPLATE_1: "https://www.figma.com/api/mcp/asset/5ca337be-f99c-4b35-9566-dcf425fde118",
};

const templates = [
  {
    id: "TEMPLATE_3" as const,
    href: "/templates/editorial",
    label: "에디토리얼형",
    imageClassName: styles.editorialImage,
  },
  {
    id: "TEMPLATE_2" as const,
    href: "/templates/modern",
    label: "다크 모던형",
    imageClassName: styles.modernImage,
  },
  {
    id: "TEMPLATE_1" as const,
    href: "/templates/classic",
    label: "클래식 시장형",
    imageClassName: styles.classicImage,
  },
];

const featureGroups = [
  {
    title: "시장 소개",
    options: ["시장 소개", "시장 역사 소개", "찾아오시는 길"],
  },
  {
    title: "점포 안내",
    options: ["점포 검색하기", "점포 상세 페이지"],
  },
  {
    title: "관광 정보",
    options: ["주변 관광 정보", "시장 추천 코스"],
  },
];

export default function TemplateSelectionPage() {
  const router = useRouter();
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("TEMPLATE_3");
  const [previewTemplate, setPreviewTemplate] = useState<TemplateType | null>(null);
  const [openFeature, setOpenFeature] = useState("점포 안내");
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedTemplateHref =
    templates.find((template) => template.id === selectedTemplate)?.href ?? "/templates/editorial";
  const previewTemplateData = previewTemplate
    ? templates.find((template) => template.id === previewTemplate)
    : null;

  useEffect(() => {
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!previewTemplate) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [previewTemplate]);

  async function pollUntilDone(jobId: string | number) {
    try {
      const result = await getMarketPageStatus(jobId);

      if (result.status === "DONE") {
        setIsGenerating(false);
        const pageId = result.pageId ?? jobId;
        router.push(`${selectedTemplateHref}?pageId=${encodeURIComponent(String(pageId))}`);
        return;
      }

      if (result.status === "FAILED") {
        setIsGenerating(false);
        window.alert(result.error ?? "AI 웹페이지 생성에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      pollTimer.current = setTimeout(() => pollUntilDone(jobId), 5000);
    } catch (error) {
      setIsGenerating(false);
      const apiError = error as MarketPageApiError;
      window.alert(apiError.message ?? "생성 상태 확인에 실패했습니다.");
    }
  }

  async function handleComplete() {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      const result = await createMarketPage(selectedTemplate);
      pollUntilDone(result.jobId ?? result.pageId);
    } catch (error) {
      setIsGenerating(false);
      const apiError = error as MarketPageApiError;
      window.alert(apiError.message ?? "웹페이지 생성 요청에 실패했습니다.");
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
          src={backgroundImage}
        />
      </div>

      <section className={styles.hero}>
        <h1>우리 시장 웹사이트 만들기</h1>
        <p>원하시는 웹사이트 디자인, 기능을 선택하실 수 있어요</p>
      </section>

      <section className={styles.builderPanel} aria-label="웹사이트 만들기 설정">
        <section className={styles.stepSection} aria-labelledby="design-step-title">
          <h2 id="design-step-title">1단계 - 원하는 웹사이트 디자인 선택하기</h2>
          <p>
            세 가지 디자인 중 원하는 디자인을 선택해주세요. 하단 ‘미리보기&apos; 버튼을
            활용해 상세 페이지 디자인을 확인할 수 있습니다.
          </p>

          <div className={styles.templatePicker} aria-label="템플릿 디자인 선택">
            {templates.map((template) => {
              const isSelected = selectedTemplate === template.id;

              return (
                <article className={styles.templateOption} key={template.id}>
                  <button
                    aria-label={`${template.label} 선택`}
                    aria-pressed={isSelected}
                    className={`${styles.radioButton} ${isSelected ? styles.selectedRadio : ""}`}
                    type="button"
                    onClick={() => setSelectedTemplate(template.id)}
                  />
                  <button
                    className={styles.templatePreview}
                    type="button"
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <Image
                      alt={`${template.label} 미리보기 이미지`}
                      className={template.imageClassName}
                      fill
                      sizes="287px"
                      src={templateImages[template.id]}
                    />
                  </button>
                  {isSelected && (
                    <button
                      className={styles.previewLink}
                      type="button"
                      onClick={() => setPreviewTemplate(template.id)}
                    >
                      미리보기
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <hr className={styles.divider} />

        <section className={styles.stepSection} aria-labelledby="feature-step-title">
          <h2 id="feature-step-title">2단계 - 웹사이트에 넣을 기능 선택하기</h2>
          <p>
            웹사이트에 넣고싶은 기능을 모두 선택해주세요. 선택하시는 기능에 따라
            웹사이트 제작을 위해 필요한 정보가 달라집니다.
          </p>
          <div className={styles.helperText}>
            <span aria-hidden="true" />
            버튼을 누르시면 상세 기능도 선택하실 수 있어요
          </div>

          <div className={styles.featureList}>
            {featureGroups.map((group) => {
              const isOpen = openFeature === group.title;

              return (
                <div
                  className={`${styles.featureGroup} ${isOpen ? styles.openFeature : ""}`}
                  key={group.title}
                >
                  <button
                    aria-expanded={isOpen}
                    className={styles.featureSummary}
                    type="button"
                    onClick={() => setOpenFeature(isOpen ? "" : group.title)}
                  >
                    <span className={styles.featureDot} aria-hidden="true" />
                    <span>{group.title}</span>
                    <i aria-hidden="true" />
                  </button>
                  {isOpen && (
                    <div className={styles.featureOptions}>
                      {group.options.map((option) => (
                        <label key={option}>
                          <input defaultChecked type="checkbox" />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className={styles.actions}>
          <Link className={styles.secondaryAction} href="/">
            저장 후 나가기
          </Link>
          <button
            className={styles.primaryAction}
            disabled={isGenerating}
            type="button"
            onClick={handleComplete}
          >
            {isGenerating ? "생성 중..." : "선택 완료"}
          </button>
        </div>
      </section>

      {previewTemplate && previewTemplateData && (
        <div
          className={styles.previewOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={`${previewTemplateData.label} 미리보기`}
        >
          <div className={styles.previewModal}>
            <button
              className={styles.closePreview}
              type="button"
              aria-label="미리보기 닫기"
              onClick={() => setPreviewTemplate(null)}
            />
            <button
              className={`${styles.useDesignButton} ${styles[`useDesignButton_${previewTemplate}`]}`}
              type="button"
              onClick={() => {
                setSelectedTemplate(previewTemplate);
                setPreviewTemplate(null);
              }}
            >
              이 디자인 사용하기
            </button>
            <h2 className={styles.previewTitle}>Main Page</h2>
            <div className={styles.largePreview}>
              <iframe
                title={`${previewTemplateData.label} 실제 템플릿 미리보기`}
                src={previewTemplateData.href}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

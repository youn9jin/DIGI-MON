"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { type MarketPageSection, type TemplateType } from "@/lib/api/market-page";
import styles from "./templates.module.css";

const backgroundImage =
  "/images/templates/selection-background.webp";
const templateImages: Record<TemplateType, string> = {
  TEMPLATE_3: "/images/templates/template-editorial.webp",
  TEMPLATE_2: "/images/templates/template-modern.webp",
  TEMPLATE_1: "/images/templates/template-classic.webp",
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
    options: [
      { id: "intro", label: "시장 소개", section: "intro" },
      { id: "history", label: "시장 역사 소개", section: "history" },
      { id: "directions", label: "찾아오시는 길", section: "directions" },
    ],
  },
  {
    title: "점포 안내",
    options: [
      { id: "storeSearch", label: "점포 검색하기", section: "stores" },
      { id: "storeDetail", label: "점포 상세 페이지", section: "stores" },
    ],
  },
  {
    title: "관광 정보",
    options: [
      { id: "tourismNearby", label: "주변 관광 정보", section: "tourism" },
      { id: "tourismCourse", label: "시장 추천 코스", section: "tourism" },
    ],
  },
] satisfies {
  title: string;
  options: { id: string; label: string; section: MarketPageSection }[];
}[];

const defaultFeatureOptionIds = featureGroups.flatMap((group) =>
  group.options.map((option) => option.id),
);

const setupStorageKey = "market_page_setup_draft";

export default function TemplateSelectionPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("TEMPLATE_3");
  const [previewTemplate, setPreviewTemplate] = useState<TemplateType | null>(null);
  const [openFeature, setOpenFeature] = useState("점포 안내");
  const [selectedFeatureOptionIds, setSelectedFeatureOptionIds] =
    useState<string[]>(defaultFeatureOptionIds);

  const previewTemplateData = previewTemplate
    ? templates.find((template) => template.id === previewTemplate)
    : null;

  useEffect(() => {
    if (!previewTemplate) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [previewTemplate]);

  function handleComplete() {
    const selectedSections = Array.from(
      new Set(
        featureGroups.flatMap((group) =>
          group.options
            .filter((option) => selectedFeatureOptionIds.includes(option.id))
            .map((option) => option.section),
        ),
      ),
    );

    window.sessionStorage.setItem(
      setupStorageKey,
      JSON.stringify({
        templateType: selectedTemplate,
        selectedSections,
      }),
    );
    router.push(`/templates/info?template=${encodeURIComponent(selectedTemplate)}`);
  }

  function toggleFeatureOption(optionId: string) {
    setSelectedFeatureOptionIds((current) =>
      current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId],
    );
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
                        <label key={option.id}>
                          <input
                            checked={selectedFeatureOptionIds.includes(option.id)}
                            type="checkbox"
                            onChange={() => toggleFeatureOption(option.id)}
                          />
                          <span>{option.label}</span>
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
            type="button"
            onClick={handleComplete}
          >
            선택 완료
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

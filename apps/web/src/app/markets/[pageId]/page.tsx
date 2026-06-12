"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import ClassicMarketTemplate, {
  type ClassicMarketTemplateData,
} from "@/components/templates/ClassicMarketTemplate";
import EditorialMarketTemplate, {
  type EditorialMarketTemplateData,
} from "@/components/templates/EditorialMarketTemplate";
import ModernMarketTemplate, {
  type ModernMarketTemplateData,
} from "@/components/templates/ModernMarketTemplate";
import TemplatePreviewStatus from "@/components/templates/TemplatePreviewStatus";
import {
  getPublicMarketPageContent,
  type MarketPageApiError,
  type MarketPageContentResponse,
} from "@/lib/api/market-page";
import {
  getTemplateRouteSlug,
  mapClassicMarketPageContent,
  mapEditorialMarketPageContent,
  mapModernMarketPageContent,
} from "@/lib/market-page-template-data";
import { usePublicMarketOperatingHours } from "@/lib/use-public-market-operating-hours";

export default function PublicMarketPage() {
  const params = useParams<{ pageId: string }>();
  const marketId = params.pageId;
  const publicBasePath = useMemo(() => `/markets/${encodeURIComponent(marketId)}`, [marketId]);
  const [content, setContent] = useState<MarketPageContentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const operatingHours = usePublicMarketOperatingHours(
    marketId,
    content?.operatingHours,
  );

  useEffect(() => {
    let isMounted = true;

    async function loadContent() {
      try {
        setIsLoading(true);
        const data = await getPublicMarketPageContent(marketId);
        if (!isMounted) return;
        setContent(data);
        setErrorMessage("");
      } catch (error) {
        if (!isMounted) return;
        const apiError = error as Partial<MarketPageApiError>;
        setErrorMessage(
          apiError.message ??
            (error instanceof Error
              ? error.message
              : "생성된 웹페이지 콘텐츠를 불러오지 못했습니다."),
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadContent();

    return () => {
      isMounted = false;
    };
  }, [marketId]);

  if (isLoading) {
    return (
      <TemplatePreviewStatus
        title="웹페이지를 불러오는 중"
        tone="loading"
        message="공개 웹사이트 콘텐츠를 가져오고 있어요."
      />
    );
  }

  if (!content || errorMessage) {
    return (
      <TemplatePreviewStatus
        title="웹페이지 내용을 불러오지 못했어요"
        tone="error"
        message={errorMessage || "생성된 웹페이지가 아직 준비되지 않았습니다."}
      />
    );
  }

  const templateSlug = getTemplateRouteSlug(content.templateType);

  if (templateSlug === "classic") {
    const data: Partial<ClassicMarketTemplateData> =
      mapClassicMarketPageContent(content);
    return (
      <ClassicMarketTemplate data={data} publicBasePath={publicBasePath} />
    );
  }

  if (templateSlug === "modern") {
    const data: Partial<ModernMarketTemplateData> = mapModernMarketPageContent(content);
    return <ModernMarketTemplate data={data} publicBasePath={publicBasePath} />;
  }

  const data: Partial<EditorialMarketTemplateData> =
    mapEditorialMarketPageContent(content);
  data.operatingHours = operatingHours;
  return <EditorialMarketTemplate data={data} publicBasePath={publicBasePath} />;
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import EditorialMarketStoreDetailTemplate from "@/components/templates/EditorialMarketStoreDetailTemplate";
import TemplatePreviewStatus from "@/components/templates/TemplatePreviewStatus";
import {
  getPublicMarketPageContent,
  type MarketPageApiError,
  type MarketPageContentResponse,
} from "@/lib/api/market-page";
import { getStore } from "@/lib/api/stores";
import {
  mapStoreToTemplateStore,
  type TemplateStore,
} from "@/lib/template-store-data";

function findPublicStore(content: MarketPageContentResponse, storeId: string) {
  const publicStores = content.stores ?? [];
  const matchedStore = publicStores.find((store, index) => {
    const id = String(store.storeId ?? store.id ?? index + 1);
    return id === storeId;
  });
  if (matchedStore) return matchedStore;

  return content.storeHighlights?.[Number(storeId) - 1]
    ? {
        id: storeId,
        name: content.storeHighlights[Number(storeId) - 1]?.storeName,
        highlight: content.storeHighlights[Number(storeId) - 1]?.highlight,
        description: content.storeHighlights[Number(storeId) - 1]?.highlight,
      }
    : null;
}

export default function PublicEditorialStoreDetailPage() {
  const params = useParams<{ pageId: string; storeId: string }>();
  const marketId = params.pageId;
  const storeId = params.storeId;
  const publicBasePath = useMemo(
    () => `/markets/${encodeURIComponent(marketId)}`,
    [marketId],
  );
  const [content, setContent] = useState<MarketPageContentResponse | null>(null);
  const [store, setStore] = useState<TemplateStore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadStore() {
      try {
        setIsLoading(true);
        const publicContent = await getPublicMarketPageContent(marketId);
        if (!isMounted) return;

        setContent(publicContent);
        let nextStore: TemplateStore | null = null;

        try {
          nextStore = mapStoreToTemplateStore(await getStore(storeId));
        } catch {
          const publicStore = findPublicStore(publicContent, storeId);
          nextStore = publicStore ? mapStoreToTemplateStore(publicStore) : null;
        }

        if (!isMounted) return;
        setStore(nextStore);
        setErrorMessage(nextStore ? "" : "해당 점포 정보를 찾을 수 없습니다.");
      } catch (error) {
        if (!isMounted) return;
        const apiError = error as Partial<MarketPageApiError>;
        setErrorMessage(
          apiError.message ??
            (error instanceof Error
              ? error.message
              : "점포 상세 정보를 불러오지 못했습니다."),
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadStore();

    return () => {
      isMounted = false;
    };
  }, [marketId, storeId]);

  if (isLoading) {
    return (
      <TemplatePreviewStatus
        title="점포 정보를 불러오는 중"
        message="선택한 점포 정보를 가져오고 있어요."
      />
    );
  }

  if (!content || !store || errorMessage) {
    return (
      <TemplatePreviewStatus
        title="점포 정보를 불러오지 못했어요"
        message={errorMessage || "점포 정보가 아직 준비되지 않았습니다."}
      />
    );
  }

  return (
    <EditorialMarketStoreDetailTemplate
      store={store}
      marketName={content.marketName ?? "Market Name"}
      address={content.address ?? "상세주소 text"}
      contact={content.contact ?? "TELEPHONENUM"}
      heroImageUrl={content.heroImageUrl ?? content.introImageUrls?.[0] ?? undefined}
      publicBasePath={publicBasePath}
    />
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import ClassicMarketStoreDetailTemplate from "@/components/templates/ClassicMarketStoreDetailTemplate";
import EditorialMarketStoreDetailTemplate from "@/components/templates/EditorialMarketStoreDetailTemplate";
import ModernMarketStoreDetailTemplate from "@/components/templates/ModernMarketStoreDetailTemplate";
import TemplatePreviewStatus from "@/components/templates/TemplatePreviewStatus";
import {
  getPublicMarketPageContent,
  type MarketPageApiError,
  type MarketPageContentResponse,
} from "@/lib/api/market-page";
import { getStore } from "@/lib/api/stores";
import {
  mapStoreToTemplateStore,
  preferUploadedStoreImages,
  type TemplateStore,
} from "@/lib/template-store-data";
import { getTemplateRouteSlug } from "@/lib/market-page-template-data";

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

function mergeStoreImages(
  publicStore: TemplateStore,
  ownerStore?: TemplateStore,
): TemplateStore {
  if (!ownerStore) return publicStore;

  return {
    ...publicStore,
    storeImageUrls: preferUploadedStoreImages(
      publicStore.storeImageUrls,
      ownerStore.storeImageUrls,
    ),
    menuImageUrls:
      publicStore.menuImageUrls.length > 0
        ? publicStore.menuImageUrls
        : ownerStore.menuImageUrls,
    productImageUrls:
      publicStore.productImageUrls.length > 0
        ? publicStore.productImageUrls
        : ownerStore.productImageUrls,
  };
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
        const publicStore = findPublicStore(publicContent, storeId);
        let nextStore = publicStore ? mapStoreToTemplateStore(publicStore) : null;

        if (nextStore) {
          try {
            const ownerStore = mapStoreToTemplateStore(await getStore(storeId));
            nextStore = mergeStoreImages(nextStore, ownerStore);
          } catch {
            // Public visitors may not be authenticated. Keep the public API response.
          }
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
        tone="loading"
        message="선택한 점포 정보를 가져오고 있어요."
      />
    );
  }

  if (!content || !store || errorMessage) {
    return (
      <TemplatePreviewStatus
        title="점포 정보를 불러오지 못했어요"
        tone="error"
        message={errorMessage || "점포 정보가 아직 준비되지 않았습니다."}
      />
    );
  }

  return (
    (() => {
      const commonProps = {
        store,
        marketName: content.marketName ?? "Market Name",
        logoImageUrl: content.logoImageUrl ?? undefined,
        address: content.address ?? "상세주소 text",
        contact: content.contact ?? "TELEPHONENUM",
        heroImageUrl: content.heroImageUrl ?? content.introImageUrls?.[0] ?? undefined,
        publicBasePath,
      };
      const templateSlug = getTemplateRouteSlug(content.templateType);

      if (templateSlug === "classic") {
        return (
          <ClassicMarketStoreDetailTemplate
            store={store}
            address={commonProps.address}
            contact={commonProps.contact}
            publicBasePath={publicBasePath}
          />
        );
      }

      if (templateSlug === "modern") {
        return <ModernMarketStoreDetailTemplate {...commonProps} />;
      }

      return <EditorialMarketStoreDetailTemplate {...commonProps} />;
    })()
  );
}

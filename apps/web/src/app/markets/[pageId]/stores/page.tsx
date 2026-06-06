"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import ClassicMarketIntroTemplate from "@/components/templates/ClassicMarketIntroTemplate";
import EditorialMarketStoresTemplate from "@/components/templates/EditorialMarketStoresTemplate";
import ModernMarketStoresTemplate from "@/components/templates/ModernMarketStoresTemplate";
import TemplatePreviewStatus from "@/components/templates/TemplatePreviewStatus";
import {
  getPublicMarketPageContent,
  type MarketPageApiError,
  type MarketPageContentResponse,
} from "@/lib/api/market-page";
import { getStores } from "@/lib/api/stores";
import {
  mapStoreToTemplateStore,
  type TemplateStore,
} from "@/lib/template-store-data";
import { getTemplateRouteSlug } from "@/lib/market-page-template-data";

function getFallbackStores(content: MarketPageContentResponse): TemplateStore[] {
  const publicStores = content.stores ?? [];
  if (publicStores.length > 0) {
    return publicStores.map((store, index) => mapStoreToTemplateStore(store, index));
  }

  return (content.storeHighlights ?? []).map((store, index) =>
    mapStoreToTemplateStore(
      {
        id: index + 1,
        name: store.storeName,
        description: store.highlight,
        highlight: store.highlight,
      },
      index,
    ),
  );
}

function findOwnerStore(
  publicStore: TemplateStore,
  ownerStores: TemplateStore[],
) {
  return ownerStores.find((store) => {
    const publicId = publicStore.id == null ? "" : String(publicStore.id);
    const ownerId = store.id == null ? "" : String(store.id);

    return (
      (publicId && ownerId && publicId === ownerId) ||
      store.name.trim() === publicStore.name.trim()
    );
  });
}

function mergeStoreImages(
  publicStore: TemplateStore,
  ownerStore?: TemplateStore,
): TemplateStore {
  if (!ownerStore) return publicStore;

  return {
    ...publicStore,
    storeImageUrls:
      publicStore.storeImageUrls.length > 0
        ? publicStore.storeImageUrls
        : ownerStore.storeImageUrls,
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

export default function PublicEditorialStoresPage() {
  const params = useParams<{ pageId: string }>();
  const marketId = params.pageId;
  const publicBasePath = useMemo(
    () => `/markets/${encodeURIComponent(marketId)}`,
    [marketId],
  );
  const [content, setContent] = useState<MarketPageContentResponse | null>(null);
  const [stores, setStores] = useState<TemplateStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadStores() {
      try {
        setIsLoading(true);
        const publicContent = await getPublicMarketPageContent(marketId);
        if (!isMounted) return;

        setContent(publicContent);
        const publicStores = getFallbackStores(publicContent);
        let nextStores = publicStores;

        try {
          const ownerStores = (await getStores()).stores.map((store, index) =>
            mapStoreToTemplateStore(store, index),
          );
          nextStores = publicStores.map((store) =>
            mergeStoreImages(store, findOwnerStore(store, ownerStores)),
          );
        } catch {
          // Public visitors may not be authenticated. Keep the public API response.
        }

        if (!isMounted) return;
        setStores(nextStores);
        setErrorMessage("");
      } catch (error) {
        if (!isMounted) return;
        const apiError = error as Partial<MarketPageApiError>;
        setErrorMessage(
          apiError.message ??
            (error instanceof Error
              ? error.message
              : "점포 목록을 불러오지 못했습니다."),
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadStores();

    return () => {
      isMounted = false;
    };
  }, [marketId]);

  if (isLoading) {
    return (
      <TemplatePreviewStatus
        title="점포 목록을 불러오는 중"
        tone="loading"
        message="등록된 점포 정보를 가져오고 있어요."
      />
    );
  }

  if (!content || errorMessage) {
    return (
      <TemplatePreviewStatus
        title="점포 목록을 불러오지 못했어요"
        tone="error"
        message={errorMessage || "점포 정보가 아직 준비되지 않았습니다."}
      />
    );
  }

  return (
    (() => {
      const commonProps = {
        marketName: content.marketName ?? "Market Name",
        address: content.address ?? "상세주소 text",
        contact: content.contact ?? "TELEPHONENUM",
        stores,
        heroImageUrl: content.heroImageUrl ?? content.introImageUrls?.[0] ?? undefined,
        publicBasePath,
      };
      const templateSlug = getTemplateRouteSlug(content.templateType);

      if (templateSlug === "classic") {
        return (
          <ClassicMarketIntroTemplate
            marketName={commonProps.marketName}
            address={commonProps.address}
            contact={commonProps.contact}
            stores={stores}
            publicBasePath={publicBasePath}
          />
        );
      }

      if (templateSlug === "modern") {
        return <ModernMarketStoresTemplate {...commonProps} />;
      }

      return <EditorialMarketStoresTemplate {...commonProps} />;
    })()
  );
}

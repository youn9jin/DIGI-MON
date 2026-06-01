import type { ClassicMarketTemplateData } from "@/components/templates/ClassicMarketTemplate";
import type { EditorialMarketTemplateData } from "@/components/templates/EditorialMarketTemplate";
import type { ModernMarketTemplateData } from "@/components/templates/ModernMarketTemplate";
import type { MarketPageContentResponse } from "@/lib/api/market-page";
import type { MeResponse } from "@/lib/api/me";

function getFeature(
  content: MarketPageContentResponse,
  index: number,
): { title?: string; description?: string } {
  return content.features?.[index] ?? {};
}

function getStoreHighlight(
  content: MarketPageContentResponse,
  index: number,
): { storeName?: string; highlight?: string } {
  return content.storeHighlights?.[index] ?? {};
}

function firstText(...values: Array<string | null | undefined>): string {
  return values.find((value) => value && value.trim().length > 0) ?? "";
}

function optionalText(value: string): string | undefined {
  return value.trim().length > 0 ? value : undefined;
}

function commonMarketFields(content: MarketPageContentResponse, me?: MeResponse) {
  const marketName = optionalText(firstText(content.marketName, me?.marketName));
  const address = optionalText(firstText(content.address, me?.address));
  const contact = optionalText(firstText(content.contact));

  return {
    ...(marketName ? { marketName } : {}),
    ...(address ? { address } : {}),
    ...(contact ? { contact } : {}),
  };
}

export function mapClassicMarketPageContent(
  content: MarketPageContentResponse,
  me?: MeResponse,
): Partial<ClassicMarketTemplateData> {
  const firstFeature = getFeature(content, 0);
  const secondFeature = getFeature(content, 1);

  return {
    ...commonMarketFields(content, me),
    intro: firstText(content.intro?.content, content.hero?.description),
    heroTitle: firstText(content.hero?.title, content.marketName, me?.marketName),
    heroSubtitle: firstText(content.hero?.subtitle, firstFeature.title),
    heroBody: firstText(content.hero?.description, content.intro?.content),
    secondTitle: firstText(firstFeature.title, secondFeature.title),
    secondSubtitle: firstText(secondFeature.title, firstFeature.title),
    secondBody: firstText(firstFeature.description, secondFeature.description),
  };
}

export function mapModernMarketPageContent(
  content: MarketPageContentResponse,
  me?: MeResponse,
): Partial<ModernMarketTemplateData> {
  const firstFeature = getFeature(content, 0);
  const secondFeature = getFeature(content, 1);

  return {
    ...commonMarketFields(content, me),
    intro: firstText(content.intro?.content, content.hero?.description),
    heroTitle: firstText(content.hero?.title, content.marketName, me?.marketName),
    heroSubtitle: firstText(content.hero?.subtitle, content.hero?.description),
    featureTitle: firstText(firstFeature.title, secondFeature.title),
    featureBody: firstText(firstFeature.description, secondFeature.description),
    secondFeatureTitle: firstText(secondFeature.title, firstFeature.title),
    secondFeatureBody: firstText(secondFeature.description, firstFeature.description),
  };
}

export function mapEditorialMarketPageContent(
  content: MarketPageContentResponse,
  me?: MeResponse,
): Partial<EditorialMarketTemplateData> {
  const firstFeature = getFeature(content, 0);
  const secondFeature = getFeature(content, 1);
  const firstStore = getStoreHighlight(content, 0);

  return {
    ...commonMarketFields(content, me),
    intro: firstText(content.intro?.content, content.hero?.description),
    foodText: firstText(firstStore.highlight, firstFeature.description, content.hero?.subtitle),
    cultureText: firstText(secondFeature.description, firstFeature.title),
  };
}

export function getGeneratedMarketPageHref(pageId: string | number): string {
  return `/markets/${encodeURIComponent(String(pageId))}`;
}

export function getTemplateRouteSlug(templateType?: string | null): string {
  if (templateType === "TEMPLATE_1") return "classic";
  if (templateType === "TEMPLATE_2") return "modern";
  return "editorial";
}

export function getTemplatePreviewHref(templateType?: string | null): string {
  return `/templates/${getTemplateRouteSlug(templateType)}`;
}

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

function firstText(...values: Array<string | null | undefined>): string {
  return values.find((value) => value && value.trim().length > 0) ?? "";
}

export function mapClassicMarketPageContent(
  content: MarketPageContentResponse,
  me?: MeResponse,
): Partial<ClassicMarketTemplateData> {
  const firstFeature = getFeature(content, 0);
  const secondFeature = getFeature(content, 1);

  return {
    ...(me?.marketName ? { marketName: me.marketName } : {}),
    ...(me?.address ? { address: me.address } : {}),
    intro: firstText(content.intro?.content, content.hero?.description),
    heroTitle: firstText(content.hero?.title, me?.marketName),
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
    ...(me?.marketName ? { marketName: me.marketName } : {}),
    ...(me?.address ? { address: me.address } : {}),
    intro: firstText(content.intro?.content, content.hero?.description),
    heroTitle: firstText(content.hero?.title, me?.marketName),
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

  return {
    ...(me?.marketName ? { marketName: me.marketName } : {}),
    ...(me?.address ? { address: me.address } : {}),
    intro: firstText(content.intro?.content, content.hero?.description),
    foodText: firstText(firstFeature.description, content.hero?.subtitle),
    cultureText: firstText(secondFeature.description, firstFeature.title),
  };
}

export function getTemplatePreviewHref(templateType?: string | null): string {
  if (templateType === "TEMPLATE_1") return "/templates/classic";
  if (templateType === "TEMPLATE_2") return "/templates/modern";
  return "/templates/editorial";
}

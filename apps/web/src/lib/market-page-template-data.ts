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

export function mapClassicMarketPageContent(
  content: MarketPageContentResponse,
  me?: MeResponse,
): Partial<ClassicMarketTemplateData> {
  const firstFeature = getFeature(content, 0);
  const secondFeature = getFeature(content, 1);

  return {
    ...(me?.marketName ? { marketName: me.marketName } : {}),
    ...(me?.address ? { address: me.address } : {}),
    ...(content.intro?.content ? { intro: content.intro.content } : {}),
    ...(content.hero?.title ? { heroTitle: content.hero.title } : {}),
    ...(content.hero?.subtitle ? { heroSubtitle: content.hero.subtitle } : {}),
    ...(content.hero?.description ? { heroBody: content.hero.description } : {}),
    ...(firstFeature.title ? { secondTitle: firstFeature.title } : {}),
    ...(firstFeature.description ? { secondBody: firstFeature.description } : {}),
    ...(secondFeature.title ? { secondSubtitle: secondFeature.title } : {}),
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
    ...(content.intro?.content ? { intro: content.intro.content } : {}),
    ...(content.hero?.title ? { heroTitle: content.hero.title } : {}),
    ...(content.hero?.subtitle ? { heroSubtitle: content.hero.subtitle } : {}),
    ...(firstFeature.title ? { featureTitle: firstFeature.title } : {}),
    ...(firstFeature.description ? { featureBody: firstFeature.description } : {}),
    ...(secondFeature.title ? { secondFeatureTitle: secondFeature.title } : {}),
    ...(secondFeature.description ? { secondFeatureBody: secondFeature.description } : {}),
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
    ...(content.intro?.content ? { intro: content.intro.content } : {}),
    ...(firstFeature.description ? { foodText: firstFeature.description } : {}),
    ...(secondFeature.description ? { cultureText: secondFeature.description } : {}),
  };
}

export function getTemplatePreviewHref(templateType?: string | null): string {
  if (templateType === "TEMPLATE_1") return "/templates/classic";
  if (templateType === "TEMPLATE_2") return "/templates/modern";
  return "/templates/editorial";
}

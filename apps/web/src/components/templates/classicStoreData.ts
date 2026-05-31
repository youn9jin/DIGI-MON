export interface ClassicStore {
  id: string;
  category: string;
  name: string;
  intro: string;
  hours: string;
  phone: string;
  menu: string;
}

const categorySeeds = [
  { id: "seafood", category: "농/수산물", menu: "제철 농산물" },
  { id: "food", category: "먹거리", menu: "대표 메뉴명" },
  { id: "clothes", category: "의류", menu: "추천 의류" },
  { id: "household", category: "생활용품", menu: "생활용품" },
  { id: "etc", category: "기타", menu: "추천 상품" },
];

export const classicStores: ClassicStore[] = categorySeeds.flatMap((seed) => {
  const count = seed.id === "etc" ? 8 : 4;

  return Array.from({ length: count }, (_, index) => ({
    id: `${seed.id}-${index + 1}`,
    category: seed.category,
    name: `가게이름 ${index + 1}`,
    intro: "가게 한 줄 소개",
    hours: "가게 별 영업시간",
    phone: "가게 연락처",
    menu: seed.menu,
  }));
});

export function getClassicStore(storeId: string): ClassicStore {
  return classicStores.find((store) => store.id === storeId) ?? classicStores[4];
}

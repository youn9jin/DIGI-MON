from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import json
from gemini_api import generate_text

app = FastAPI()

# ─────────────────────────────────────────
# 1. Request / Response Pydantic 모델 정의
# ─────────────────────────────────────────

class OperatingHours(BaseModel):
    weekday: Optional[str] = None
    weekend: Optional[str] = None  # null이면 주말 미운영

class MarketInput(BaseModel):
    name: str = Field(..., description="시장 이름 (필수)")
    address: str = Field(..., description="시장 주소 (필수)")
    market_type: Optional[str] = "TRADITIONAL"  # TRADITIONAL / COMMERCIAL / COMPLEX
    main_categories: Optional[List[str]] = []
    total_stores: Optional[str] = None          # TEN_TO_30 등의 Enum 값
    operating_hours: Optional[OperatingHours] = None
    target_customers: Optional[str] = None
    contact: Optional[str] = None
    description: Optional[str] = Field(None, max_length=50) # 50자 이내
    manager_name: Optional[str] = None
    manager_title: Optional[str] = None

class StoreInput(BaseModel):
    name: str = Field(..., description="점포명 (필수)")
    category: Optional[str] = None
    items: Optional[str] = None
    operating_hours: Optional[str] = None
    years_of_operation: Optional[str] = None
    contact: Optional[str] = None
    description: Optional[str] = None

class UserContent(BaseModel):
    intro_text: Optional[str] = None
    history_text: Optional[str] = None
    directions_text: Optional[str] = None

class GenerateRequest(BaseModel):
    market: MarketInput
    stores: List[StoreInput]
    template_type: str  # 필수 (잘못된 값 검증은 비즈니스 로직이나 Enum으로 처리 가능)
    selected_sections: List[str]
    user_content: Optional[UserContent] = None

# 최종 응답 구조 정의 (미선택 섹션은 null로 반환됨)
class HeroSection(BaseModel):
    title: str
    subtitle: str
    description: str

class ContentSection(BaseModel):
    content: str

class FeatureItem(BaseModel):
    title: str
    description: str

class StoreHighlightItem(BaseModel):
    store_name: str
    highlight: str

class CtaSection(BaseModel):
    text: str

class GenerateResponse(BaseModel):
    hero: HeroSection
    intro: Optional[ContentSection] = None
    features: Optional[List[FeatureItem]] = None
    store_highlights: Optional[List[StoreHighlightItem]] = None
    cta: CtaSection

# ─────────────────────────────────────────
# 2. 유틸리티 함수 (Enum 자연어 변환 등)
# ─────────────────────────────────────────

def convert_total_stores(enum_value: Optional[str]) -> str:
    """total_stores Enum 값을 Gemini가 이해하기 쉬운 자연어로 변환"""
    mapping = {
        "UNDER_10": "10개 미만",
        "TEN_TO_30": "10개 이상 30개 이하",
        "THIRTY_TO_50": "30개 이상 50개 이하",
        "OVER_50": "50개 이상"
    }
    return mapping.get(enum_value, "다수의")

# ─────────────────────────────────────────
# 3. 프롬프트 빌더 (명세서 규칙 반영)
# ─────────────────────────────────────────

def build_prompt(request: GenerateRequest) -> str:
    market = request.market
    stores = request.stores
    template_type = request.template_type
    sections = request.selected_sections
    user_content = request.user_content

    # 1) total_stores 자연어 변환 처리
    stores_count_str = convert_total_stores(market.total_stores)

    # 2) 템플릿별 톤 가이드
    tone_guide = {
        "TEMPLATE_1": "따뜻하고 정겨운 동네 시장 느낌의 친근한 어조",
        "TEMPLATE_2": "세련되고 현대적인 어조, MZ세대를 타겟으로",
    }.get(template_type, "친근하고 활기찬 어조")

    # 3) selected_sections 규칙에 따른 프롬프트 지침 동적 조립
    instructions = []
    
    # Hero와 CTA는 기본 포함 (명세서 응답 예시 기준)
    instructions.append("- hero: 시장 이름, 핵심 슬로건(title/subtitle), 그리고 시장 정보를 녹여낸 2~3문장의 매력적인 요약 소개(description)를 작성하세요.")
    instructions.append("- cta: 방문을 강력히 유도하는 매력적인 문장 1개를 작성하세요.")

    # intro 섹션
    if "intro" in sections:
        intro_prime = user_content.intro_text if user_content else None
        if intro_prime:
            instructions.append(f"- intro: 사용자가 작성한 초안 [{intro_prime}] 문구를 기반으로, 전체적인 톤에 맞게 자연스럽고 풍부하게 다듬어 3~4문장의 소개글을 작성하세요.")
        else:
            instructions.append("- intro: 사용자가 작성한 초안이 없으므로, 제공된 시장 기본 데이터를 바탕으로 3~4문장 분량의 시장 전체 소개글을 창작하세요.")
    
    # history 섹션 (intro에 반영되는 성격 혹은 별도 반영 지침)
    if "history" in sections:
        history_prime = user_content.history_text if user_content else None
        if history_prime:
            instructions.append(f"- history 관련 반영: 사용자가 작성한 역사 정보 [{history_prime}]를 기반으로 시장의 깊은 역사와 전통이 느껴지도록 hero나 intro의 스토리를 더 서사적으로 풍부하게 다듬어주세요.")
        else:
            instructions.append("- history 관련 반영: 제공된 시장 데이터를 기반으로 이 시장이 지역 사회와 함께해 온 역사적 가치를 상상하여 스토리를 풍부하게 녹여내세요.")

    # features 섹션 (directions 및 tourism 포함 여부에 따라 분기)
    feature_topics = ["시장의 주요 특징 및 장점 (예: 신선한 먹거리, 편리한 시설 등)"]
    if "directions" in sections:
        dir_prime = user_content.directions_text if user_content else None
        if dir_prime:
            feature_topics.append(f"찾아오시는 길 정보(교통편/위치: {dir_prime})를 방문객이 알기 쉽게 정리한 내용")
        else:
            feature_topics.append(f"시장 주소({market.address})를 기반으로 한 접근성 및 위치 안내")
    if "tourism" in sections:
        feature_topics.append("시장 주변의 명소, 즐길 거리, 혹은 시장 자체의 관광 요소 및 MZ세대 추천 포인트")

    instructions.append(f"- features: 아래의 주제들을 조합하여 총 2~3개의 핵심 특징 카드 항목(title, description)을 리스트 형태로 생성하세요.\n  (포함할 주제: {', '.join(feature_topics)})")

    # stores 섹션
    if "stores" in sections:
        instructions.append("- store_highlights: 제공된 점포 목록의 정보를 바탕으로, 각 상점의 업종, 취급 품목, 운영 연수 등의 특징이 한눈에 보이도록 '한줄 매력 포인트(highlight)'를 상점별로 작성하세요.")

    # 4) 데이터 직렬화 (주말 null 처리 반영)
    market_data = market.model_dump()
    market_data["total_stores_converted"] = stores_count_str
    
    # 5) 최종 프롬프트 조립
    return f"""
전통시장 홍보 웹페이지 콘텐츠를 생성해주는 전문 카피라이터 역할을 수행해주세요.
전체적인 작성 톤: {tone_guide}

[작성 지침 및 섹션별 요구사항]
{chr(10).join(instructions)}

[공통 제약 사항]
- 출력 포맷에 명시된 JSON 구조를 완벽하게 준수하세요.
- 마크다운 태그(```json 등)는 절대 포함하지 마세요. 오직 순수 JSON 텍스트만 반환해야 합니다.

[시장 기본 정보]
{json.dumps(market_data, ensure_ascii=False, indent=2)}

[점포 목록 정보]
{json.dumps([s.model_dump() for s in stores], ensure_ascii=False, indent=2)}

[반드시 준수해야 할 출력 JSON 포맷]
{{
  "hero": {{
    "title": "...",
    "subtitle": "...",
    "description": "..."
  }},
  "intro": {{
    "content": "..."
  }},
  "features": [
    {{"title": "...", "description": "..."}}
  ],
  "store_highlights": [
    {{"store_name": "...", "highlight": "..."}}
  ],
  "cta": {{
    "text": "..."
  }}
}}
"""

# ─────────────────────────────────────────
# 4. 엔드포인트 및 예외 처리
# ─────────────────────────────────────────

@app.post("/generate", response_model=GenerateResponse)
async def generate_content(request: GenerateRequest):
    # 템플릿 타입 사전 검증 (422 에러 대응)
    if request.template_type not in ["TEMPLATE_1", "TEMPLATE_2"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="잘못된 template_type입니다. 'TEMPLATE_1' 또는 'TEMPLATE_2'를 사용하세요."
        )

    # 프롬프트 생성 및 Gemini 호출
    prompt = build_prompt(request)
    
    try:
        raw_response = generate_text(prompt, temperature=0.7, max_output_tokens=4096)
    except Exception as e:
        # Gemini 호출 자체 실패 시 500 에러 반환
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gemini API 호출 실패: {str(e)}"
        )

    if not raw_response:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini API로부터 빈 응답을 받았습니다."
        )

    # 데이터 정제 로직
    clean = raw_response.strip()
    if clean.startswith("```"):
        clean = clean.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    if clean.startswith("json"):
        clean = clean.split("json", 1)[1].strip()

    try:
        llm_data = json.loads(clean)
    except json.JSONDecodeError:
        # JSON 파싱 실패 시 500 에러 및 원본 데이터 백업 반환
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "LLM 응답 JSON 파싱 실패", "raw_response": raw_response}
        )

    # 명세서 규칙: 미선택 섹션 필드는 null 처리
    sections = request.selected_sections
    
    response_dict = {
        "hero": llm_data.get("hero"),
        "intro": llm_data.get("intro") if "intro" in sections else None,
        "features": llm_data.get("features") if any(sec in sections for sec in ["intro", "directions", "tourism"]) else None,
        "store_highlights": llm_data.get("store_highlights") if "stores" in sections else None,
        "cta": llm_data.get("cta")
    }

    return response_dict
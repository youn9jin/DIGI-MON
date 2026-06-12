from fastapi import FastAPI, HTTPException, status
from fastapi.exceptions import ResponseValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import json
import traceback
from gemini_api import generate_text

app = FastAPI()

@app.exception_handler(ResponseValidationError)
async def response_validation_error_handler(request, exc):
    # response_model 검증 실패 시 실제 오류 내용을 로그에 출력
    print(f"[ResponseValidationError] {exc.errors()}")
    return JSONResponse(
        status_code=500,
        content={"detail": f"응답 검증 실패: {str(exc.errors())}"}
    )

# ─────────────────────────────────────────
# 1. Request / Response Pydantic 모델 정의
# ─────────────────────────────────────────

class OperatingHoursInput(BaseModel):
    weekday: Optional[str] = None
    weekend: Optional[str] = None  # null이면 주말 미운영

class MarketInput(BaseModel):
    name: str = Field(..., description="시장 이름 (필수)")
    address: str = Field(..., description="시장 주소 (필수)")
    market_type: Optional[str] = None  # TRADITIONAL / COMMERCIAL / COMPLEX
    main_categories: Optional[List[str]] = []
    total_stores: Optional[str] = None          # UNDER_10, TEN_TO_30 등의 Enum 값
    operating_hours: Optional[OperatingHoursInput] = None  # 객체 타입으로 변경
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

class GenerateRequest(BaseModel):
    market: MarketInput
    stores: List[StoreInput]
    template_type: str  
    selected_sections: Optional[List[str]] = None  # Optional로 변경
    user_content: Optional[Dict[str, Any]] = None  # Dict[str, Any] 구조로 변경하여 유연화

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
# 3. 프롬프트
# ─────────────────────────────────────────

def build_prompt(request: GenerateRequest) -> str:
    market = request.market
    stores = request.stores
    template_type = request.template_type
    
    # 데이터가 비어있을 경우를 대비한 방어 코드
    sections = request.selected_sections or []
    user_content = request.user_content or {}

    # 1) 입력 데이터 및 템플릿 설정 사전 정제
    stores_count_str = convert_total_stores(market.total_stores)
    market_data = market.model_dump()
    market_data["total_stores_converted"] = stores_count_str

    # 2) 완벽한 프롬프트 서식 형태로 조립
    return f"""
# 시스템 역할 및 페르소나
당신은 전통시장 소상공인과 상인회를 위해 홍보 웹페이지 콘텐츠를 제작하는 전문 카피라이터입니다.
제공된 시장 데이터와 요청 사항을 분석하여 최적의 웹 사이트 카피를 JSON 형태로 생성하세요.


# [핵심] 섹션별 생성 유무 및 작성 규칙
LLM인 당신은 아래의 '선택된 섹션 목록'에 포함된 항목만 콘텐츠를 생성해야 합니다. 
포함되지 않은 섹션은 본문의 내용을 작성하지 말고 반드시 출력 포맷에서 지정한 대로 빈 값(null) 처리하거나 생략하세요.

## 1. 선택된 섹션 목록 (생성할 항목)
- {", ".join(sections) if sections else "선택된 섹션 없음 (기본 hero, cta만 생성)"}

## 2. 섹션별 세부 지침
- hero (기본 필수): 시장 이름과 제공된 데이터를 녹여내어 핵심 슬로건(title/subtitle)과 2~3문장의 매력적인 요약 소개글(description)을 작성하세요.
- cta (기본 필수): 방문을 강력히 유도하는 매력적인 마케팅 문구 1개를 작성하세요.
- intro '선택된 섹션 목록'에 포함된 경우에만 생성합니다. [사용자 초안: {user_content.get("intro_text", "없음")}]이 있다면 이를 기반으로 3~4문장의 자연스러운 소개글로 확장하고, 없다면 시장 정보를 바탕으로 창작하세요.
- history 관련 반영**: '선택된 섹션 목록'에 'history'가 포함된 경우, [사용자 초안: {user_content.get("history_text", "없음")}]를 바탕으로 시장의 깊은 역사와 전통이 느껴지도록 hero나 intro의 스토리를 더 서사적이고 풍부하게 다듬어주세요.
- features '선택된 섹션 목록'에 [intro, directions, tourism] 중 하나라도 포함되면 생성합니다. 아래의 서브 데이터를 조합하여 2~3개의 핵심 특징 카드(title, description)를 리스트 형태로 만드세요.
  * directions 포함 시 반영할 정보: {f"교통편 위치 ({user_content.get('directions_text')})" if user_content.get('directions_text') else f"시장 주소({market.address}) 기반 접근성 안내"}
  * tourism 포함 시 반영할 정보: 시장 주변의 명소, 즐길 거리, 혹은 시장 자체의 관광 요소 및 MZ세대 추천 포인트
- store_highlights '선택된 섹션 목록'에 'stores'가 포함된 경우에만 생성합니다. 제공된 점포 목록을 바탕으로 상점별 '한줄 매력 포인트(highlight)'를 작성하세요.

# 입력 데이터
## 1. 시장 기본 정보
{json.dumps(market_data, ensure_ascii=False, indent=2)}

## 2. 등록된 점포 목록
{json.dumps([s.model_dump() for s in stores], ensure_ascii=False, indent=2)}

# 공통 제약 사항
- 출력 포맷에 명시된 JSON 구조를 완벽하게 준수하세요.
- 결과물에 마크다운 태그(```json 등)는 절대 포함하지 마세요. 오직 순수 JSON 텍스트만 반환해야 합니다.

# 반드시 준수해야 할 출력 JSON 포맷
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
    {{
      "title": "...",
      "description": "..."
    }}
  ],
  "store_highlights": [
    {{
      "store_name": "...",
      "highlight": "..."
    }}
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
    if request.template_type not in ["TEMPLATE_1", "TEMPLATE_2", "TEMPLATE_3"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="잘못된 template_type입니다."
        )

    # 프롬프트 생성 및 Gemini 호출
    try:
        prompt = build_prompt(request)
    except Exception as e:
        # build_prompt 내부 예외는 기본적으로 로그 없이 FastAPI 500으로 떨어지므로 명시적으로 출력
        print(f"[build_prompt 오류] {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"프롬프트 생성 실패: {str(e)}"
        )
    
    try:
        raw_response = generate_text(prompt, temperature=0.7, max_output_tokens=4096)
    except Exception as e:
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "LLM 응답 JSON 파싱 실패", "raw_response": raw_response}
        )

    sections = request.selected_sections or []
    
    # 미선택 섹션 필드는 null 처리
    response_dict = {
        "hero": llm_data.get("hero"),
        "intro": llm_data.get("intro") if "intro" in sections else None,
        "features": llm_data.get("features") if any(sec in sections for sec in ["intro", "directions", "tourism"]) else None,
        "store_highlights": llm_data.get("store_highlights") if "stores" in sections else None,
        "cta": llm_data.get("cta")
    }

    return response_dict

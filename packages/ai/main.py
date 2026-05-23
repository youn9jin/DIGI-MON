# main.py (FastAPI 서버)

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import json
from gemini_api import generate_text

app = FastAPI()

# ─────────────────────────────────────────
# Request/Response 모델 정의
# ─────────────────────────────────────────

class MarketInput(BaseModel):
    name: str
    address: str
    operating_hours: str
    main_categories: List[str]
    description: str
    total_stores: str
    target_customers: str
    manager_name: str
    manager_title: str

class StoreInput(BaseModel):
    name: str
    category: str
    description: str
    operating_hours: str
    contact: str

class GenerateRequest(BaseModel):
    market: MarketInput
    stores: List[StoreInput]
    template_type: str  # "TEMPLATE_1", "TEMPLATE_2" 등

# ─────────────────────────────────────────
# 프롬프트 빌더
# ─────────────────────────────────────────

def build_prompt(market: MarketInput, stores: List[StoreInput], template_type: str) -> str:
    # template_type에 따라 톤/스타일 지시 분기
    tone_guide = {
        "TEMPLATE_1": "따뜻하고 정겨운 동네 시장 느낌의 친근한 어조",
        "TEMPLATE_2": "세련되고 현대적인 어조, MZ세대를 타겟으로",
    }.get(template_type, "친근하고 활기찬 어조")

    return f"""
전통시장 홍보 웹페이지 콘텐츠를 생성해주세요.
작성 톤: {tone_guide}

[작성 지침]
- hero: 시장 이름, 핵심 슬로건, 2~3문장 소개
- intro: 시장 전체 소개 (3~4문장)
- features: 시장의 주요 특징 3가지 (각 제목 + 설명)
- store_highlights: 각 상점의 한줄 매력 포인트
- cta: 방문 유도 문구 1문장
- 반드시 마크다운 없이 순수 JSON만 반환하세요. 코드블록(```)도 포함하지 마세요.

[시장 정보]
{json.dumps(market.model_dump(), ensure_ascii=False)}

[점포 목록]
{json.dumps([s.model_dump() for s in stores], ensure_ascii=False)}

[출력 포맷]
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
    {{"title": "...", "description": "..."}},
    {{"title": "...", "description": "..."}},
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
# 엔드포인트
# ─────────────────────────────────────────

@app.post("/generate")
async def generate_content(request: GenerateRequest):
    prompt = build_prompt(request.market, request.stores, request.template_type)

    raw_response = generate_text(prompt, temperature=0.7, max_output_tokens=4096)

    if not raw_response:
        return {"error": "Gemini API 응답 없음"}

    # LLM이 코드블록을 섞어 반환하는 경우 정제 (기존 코드 재활용)
    clean = raw_response.strip()
    if clean.startswith("```"):
        clean = clean.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    if clean.startswith("json"):
        clean = clean.split("json", 1)[1].strip()

    try:
        return json.loads(clean)
    except json.JSONDecodeError:
        return {"error": "JSON 파싱 실패", "raw": raw_response}
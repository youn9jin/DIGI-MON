"""
DIGI-MON AI 엔진 서버. FastAPI 앱 진입점.
실행: packages/ai 디렉터리에서 uvicorn app:app --host 0.0.0.0 --port 8000
"""
import json
import os
import re
import uuid
from datetime import datetime, timedelta

import google.generativeai as genai
from fastapi import Body, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from prompts.prompt import get_action_prompt
from rules.rule_base import get_priority_rules

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.environ.get("GEMINI_API_KEY", "")
if API_KEY:
    genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash") if API_KEY else None

# packages/ai 기준 경로 (app.py와 같은 디렉터리)
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def _docs_path(filename):
    return os.path.join(_BASE_DIR, "docs", filename)


def load_official_context(survey, digital_level):
    context = ""

    # 레벨 3라면 모든 가이드 로드
    if digital_level == "LEVEL3":
        context += "\n[알림: 사장님은 이미 높은 디지털 수준을 갖추고 있습니다. 아래 전체 체크리스트를 통해 누락된 고도화 항목이 있는지 확인하세요.]\n"
        path = _docs_path("google_business_profile.txt")
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                context += f.read() + "\n"
        return context

    # Q1, Q2, Q3 중 하나라도 부정적이면 구글 가이드 로드
    needs_google = (
        survey.get("q1_map_searchable") != "EASY_FOUND"
        or survey.get("q2_map_info_accurate") != "ALL_CORRECT"
        or survey.get("q3_menu_visible") == "BARELY"
    )

    if needs_google:
        path = _docs_path("google_business_profile.txt")
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                context += f"\n[참고: 구글 비즈니스 프로필 가이드]\n{f.read()}\n"

    return context


def generate_initial_plan(owner_data, survey_data, digital_level):
    """AI를 호출하여 명세서의 initialPlan 구조에 맞는 데이터를 생성"""
    if not model:
        return {}
    rules = get_priority_rules(survey_data)
    official_context = load_official_context(survey_data, digital_level)
    final_prompt = get_action_prompt(owner_data, survey_data, rules, official_context)

    response = model.generate_content(final_prompt)

    try:
        json_match = re.search(r"\{.*\}", response.text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        return json.loads(response.text)
    except Exception as e:
        print(f"❌ AI 플랜 생성 실패: {e}")
        return {}


def process_draft_request(request_data):
    """명세서의 '서버 동작 규칙'을 수행하는 메인 함수"""
    survey = request_data.get("survey", {})
    guest_key = request_data.get("guestKey")

    if not guest_key:
        guest_key = str(uuid.uuid4())

    digital_level = request_data["digitalLevel"]

    owner_context = {
        "store_name": "햇살 베이커리",
        "business_type": "제과점",
        "digitalLevel": digital_level,
    }

    initial_plan_result = generate_initial_plan(owner_context, survey, digital_level)

    attach_token = str(uuid.uuid4())
    expires_at = (datetime.utcnow() + timedelta(hours=24)).isoformat() + "Z"

    return {
        "success": True,
        "data": {
            "guestKey": guest_key,
            "draftId": 101,
            "attachToken": attach_token,
            "attachTokenExpiresAt": expires_at,
            "digitalLevel": digital_level,
            "initialPlan": initial_plan_result.get("initialPlan", {}),
        },
        "error": None,
    }


@app.post("/api/drafts")
async def create_draft_endpoint(request_data: dict = Body(...)):
    """프론트엔드에서 JSON 데이터를 보내면 이 함수가 실행됩니다."""
    final_response = process_draft_request(request_data)
    return final_response


if __name__ == "__main__":
    import uvicorn

    print("🚀 DIGI-MON AI 엔진 서버가 8000번 포트에서 시작됩니다!")
    uvicorn.run(app, host="0.0.0.0", port=8000)

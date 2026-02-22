"""
서버 없이 한 번 돌려보는 시뮬레이션 스크립트.
실행: cd packages/ai && python run_dummy.py
"""
import json
import os
import re
import uuid
from datetime import datetime, timedelta

import google.generativeai as genai

from prompts.prompt import get_action_prompt
from rules.rule_base import get_priority_rules

API_KEY = os.environ.get("GEMINI_API_KEY", "")
if API_KEY:
    genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash") if API_KEY else None

_BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def _docs_path(filename):
    return os.path.join(_BASE_DIR, "docs", filename)


def load_official_context(survey, digital_level):
    context = ""

    if digital_level == "LEVEL3":
        context += "\n[알림: 사장님은 이미 높은 디지털 수준을 갖추고 있습니다. 아래 전체 체크리스트를 통해 누락된 고도화 항목이 있는지 확인하세요.]\n"
        path = _docs_path("google_business_profile.txt")
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                context += f.read() + "\n"
        return context

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


if __name__ == "__main__":
    if not API_KEY:
        print("⚠️ GEMINI_API_KEY 환경변수가 없습니다. AI 플랜은 비어 있을 수 있습니다.")
    # 명세서 '최초 방문' 시뮬레이션 (rule_base/prompt는 snake_case 키 사용)
    dummy_request = {
        "requestId": str(uuid.uuid4()),
        "stage": "PRE_LOGIN",
        "locale": "ko-KR",
        "digitalLevel": "LEVEL0",
        "survey": {
            "q1_map_searchable": "NOT_FOUND",
            "q2_map_info_accurate": "NONE_OR_UNKNOWN",
            "q3_menu_visible": "BARELY",
            "q4_contact_channel": "NO_CHANNEL",
            "q5_primary_goal": "INCREASE_ACCESSIBILITY",
        },
    }

    print("🚀 DIGI-MON 서버 동작 시뮬레이션 중...")

    final_response = process_draft_request(dummy_request)

    print("\n" + "=" * 20 + " API RESPONSE (201 Created) " + "=" * 20)
    print(json.dumps(final_response, indent=2, ensure_ascii=False))
    print("=" * 60)

    result_dir = os.path.join(_BASE_DIR, "result")
    os.makedirs(result_dir, exist_ok=True)
    save_path = os.path.join(result_dir, f"draft_{final_response['data']['guestKey']}.json")
    with open(save_path, "w", encoding="utf-8") as f:
        json.dump(final_response, f, ensure_ascii=False, indent=2)
    print(f"저장: {save_path}")

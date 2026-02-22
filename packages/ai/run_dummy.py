import google.generativeai as genai
import json
import re
import os
import uuid
from datetime import datetime, timedelta
from rules.rule_base import get_priority_rules
from prompts.prompt import get_action_prompt
import time
import random

from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')


def load_official_context(survey, digital_level):
    context = ""
    
    # 레벨 3라면 모든 가이드 로드 -> 이미 수행한 것들을 체크하도록
    if digital_level == "LEVEL3":
        context += "\n[알림: 사장님은 이미 높은 디지털 수준을 갖추고 있습니다. 아래 전체 체크리스트를 통해 누락된 고도화 항목이 있는지 확인하세요.]\n"
        paths = ["./docs/google_business_profile.txt"]
        for path in paths:
            if os.path.exists(path):
                with open(path, 'r', encoding='utf-8') as f:
                    context += f.read() + "\n"
        return context
    
    # Q1, Q2, Q3 중 하나라도 부정적이면 구글 가이드 로드
    needs_google = (
        survey.get('q1MapSearchable') != 'EASY_FOUND' or 
        survey.get('q2MapInfoAccurate') != 'ALL_CORRECT' or
        survey.get('q3MenuVisible') == 'BARELY'
    )
    
    if needs_google:
        path = "./docs/google_business_profile.txt"
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                context += f"\n[참고: 구글 비즈니스 프로필 가이드]\n{f.read()}\n"
    
    # # Q4가 부정적이면 인스타그램 가이드 로드 -> 이건 더 수정해야함
    # if survey.get('q4_contact_channel') != 'HAS_CHANNEL':
    #     path = "./docs/sns_guide.txt"
    #     if os.path.exists(path):
    #         with open(path, 'r', encoding='utf-8') as f:
    #             context += f"\n[참고: 인스타그램 공식 가이드]\n{f.read()}\n"
                
    return context

def generate_initial_plan(owner_data, survey_data, digital_level):
    """
    AI를 호출하여 명세서의 initialPlan 구조에 맞는 데이터를 생성
    """
    rules = get_priority_rules(survey_data)
    official_context = load_official_context(survey_data, digital_level)
    final_prompt = get_action_prompt(owner_data, survey_data, rules, official_context)
    
    response = model.generate_content(final_prompt)
    
    try:
        json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        return json.loads(response.text)
    except Exception as e:
        print(f"❌ AI 플랜 생성 실패: {e}")
        return {"initialPlan": []}

    
@app.post("/internal/plan/generate")
async def create_draft_endpoint(request_data: dict = Body(...)):
    """
    intialPlan만 반환하도록
    """
    # 1. 요청 데이터 추출
    survey = request_data.get("survey", {})
    digital_level = request_data.get("digitalLevel", "LEVEL0")
    
    # 백엔드에서 넘겨주는 기본 정보 
    store_name = request_data.get("storeName", "사장님")
    business_type = request_data.get("businessType", "소상공인")
    
    owner_context = {
        "store_name": store_name,
        "business_type": business_type,
        "digitalLevel": digital_level
    }

    # 2. AI 플랜 생성 
    initial_plan_result = generate_initial_plan(owner_context, survey, digital_level)

    # 3. initialPlan만 반환 
    return {
        "initialPlan": initial_plan_result.get("initialPlan", [])
    }
    

if __name__ == "__main__":
    import uvicorn
    print("🚀 DIGI-MON AI 엔진 서버가 8000번 포트에서 시작됩니다!")
    uvicorn.run(app, host="0.0.0.0", port=8000)

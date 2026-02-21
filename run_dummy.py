import google.generativeai as genai
import json
import re
import os
import uuid
from datetime import datetime, timedelta
from rule_base import get_priority_rules
from prompt import get_action_prompt

from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware


API_KEY = "AIzaSyADubVvQcQPJWCAotaJ5uwOEIu8eNhCcDU" 
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

def calculate_digital_level(survey):
    "설문 답변에 따른 단계별 레벨 판정"
    
    # 1단계 조건: Q1(지도 검색)이 'EASY_FOUND'이고 Q2(정보 정확)가 'ALL_CORRECT'인가?
    is_level1_pass = (survey.get('q1_map_searchable') == 'EASY_FOUND' and 
                      survey.get('q2_map_info_accurate') == 'ALL_CORRECT')
    if not is_level1_pass:
        return "LEVEL0" 

    # 2단계 조건: Q3(품목/서비스 설명)가 'ENOUGH'인가?
    is_level2_pass = (survey.get('q3_menu_visible') == 'ENOUGH')
    if not is_level2_pass:
        return "LEVEL1" 

    # 3단계 조건: Q4(연락 채널)가 'HAS_CHANNEL'인가?
    is_level3_pass = (survey.get('q4_contact_channel') == 'HAS_CHANNEL')
    if not is_level3_pass:
        return "LEVEL2" 

    return "LEVEL3" 

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
        survey.get('q1_map_searchable') != 'EASY_FOUND' or 
        survey.get('q2_map_info_accurate') != 'ALL_CORRECT' or
        survey.get('q3_menu_visible') == 'BARELY'
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
        # JSON 블록 추출
        json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        return json.loads(response.text)
    except Exception as e:
        print(f"❌ AI 플랜 생성 실패: {e}")
        return {}

def process_draft_request(request_data):
    """
    명세서의 '서버 동작 규칙'을 수행하는 메인 함수
    """
    survey = request_data.get("survey", {})
    guest_key = request_data.get("guestKey")
    
    # 1. guestKey 확인 및 새 발급 
    if not guest_key:
        guest_key = str(uuid.uuid4())
    
    # 2. digitalLevel 계산
    digital_level = calculate_digital_level(survey) ## 근데 이부분 백엔드에서 레벨 계산하면 다르게 불러와야함
    
    # 3. AI용 오너 데이터 구성 (계산된 레벨 포함)
    owner_context = {
        "store_name": "햇살 베이커리",
        "business_type": "제과점",
        "digitalLevel": digital_level
    }
    
    # 4. 액션플랜 생성
    initial_plan_result = generate_initial_plan(owner_context, survey, digital_level)
    
    # 5. attachToken 및 만료시간 생성 (명세: TTL 1~24시간)
    attach_token = str(uuid.uuid4())
    expires_at = (datetime.utcnow() + timedelta(hours=24)).isoformat() + "Z"
    
    # 6. 최종 명세서 규격 Response 구성 
    return {
      "success": True,
      "data": {
        "guestKey": guest_key,
        "draftId": 101, # 실제 DB 저장 후 반환될 ID
        "attachToken": attach_token,
        "attachTokenExpiresAt": expires_at,
        "digitalLevel": digital_level,
        "initialPlan": initial_plan_result.get("initialPlan", {})
      },
      "error": None
    }

if __name__ == "__main__":
    # 명세서의 '최초 방문' Request Body 시뮬레이션
    dummy_request = {
      "survey": {
        "q1_map_searchable": "NOT_FOUND",
        "q2_map_info_accurate": "NONE_OR_UNKNOWN",
        "q3_menu_visible": "BARELY",
        "q4_contact_channel": "NO_CHANNEL",
        "q5_primary_goal": "INCREASE_ACCESSIBILITY"
      }
    }
    
    print(f"🚀 DIGI-MON 서버 동작 시뮬레이션 중...")
    
    # 최종 결과 생성
    final_response = process_draft_request(dummy_request)

    # 결과 출력 및 저장
    print("\n" + "="*20 + " API RESPONSE (201 Created) " + "="*20)
    print(json.dumps(final_response, indent=2, ensure_ascii=False))
    print("="*60)
    
    # userID 대신 guestKey로 저장
    save_path = f"./result/draft_{final_response['data']['guestKey']}.json"
    os.makedirs("./result", exist_ok=True)
    with open(save_path, 'w', encoding='utf-8') as f:
        json.dump(final_response, f, ensure_ascii=False, indent=2)
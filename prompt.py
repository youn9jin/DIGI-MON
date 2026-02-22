# def get_action_prompt(owner, survey, rules, official_context):
#     priority_msg = ", ".join(rules) if rules else "현재 수준에 맞는 디지털 고도화"
#     primary_goal = survey.get('q5_primary_goal', '디지털 전환 기반 구축')
    
#     # 가이드가 없을 경우 AI에게 자체 지식을 쓰되 구체성을 요구하는 문구 추가
#     context_instruction = (
#         f"제공된 [공식 가이드 데이터]를 최우선으로 참고하세요:\n{official_context}" 
#         if official_context.strip() 
#         else "해당 분야의 최신 공식 절차를 당신의 지식을 바탕으로 생성하세요."
#     )

#     prompt = f"""
# 당신은 소상공인 디지털 가이드 'DIGI-MON'입니다. 
# 사장님이 화면의 카드를 보며 하나씩 따라 할 수 있도록 '3가지 액션 플랜'과 '상세 단계'를 생성하세요.
# 비유나 수식어를 배제하고, 사장님이 즉시 실행할 수 있는 '핵심 액션 3가지'를 명세서의 'initialPlan' 형식에 따라 사장님이 즉시 실행할 수 있는 액션플랜을 JSON으로 생성하세요.


# ### [사장님 가게 정보]
# - 상호명: {owner.get('store_name', '미등록')}
# - 분석된 성숙도: {owner.get('digitalLevel', 'LEVEL0')}
# - 우선순위: {priority_msg}
# - 사장님의 핵심 목표: {primary_goal}

# ### [가이드 지침]
# - {context_instruction}
# - 플랫폼 제한: 지도 서비스는 '구글 지도', SNS는 '인스타그램'만 제안할 것.
# - 톤앤매너: 비유를 배제하고 기술적 정확도와 실질적 이득 위주로 기술할 것.

# ### [출력 조건 - UI 맞춤형]
# 1. 반드시 3가지 액션 플랜을 제안할 것.
# 2. 각 플랜마다 3~4개의 세부 단계(`steps`)를 포함할 것.
# 3. step_title: UI 카드/버튼에 들어갈 10자 이내의 짧은 행동 문구.
# 4. description: 사장님이 혼자 할 수 있도록 아주 구체적인 방법과 관련 공식 URL을 포함할 것.
# 5. JSON Only: 설명 없이 오직 JSON 배열만 반환할 것.

# ### [출력 JSON 구조 정의]
# 반드시 아래 구조의 JSON 객체 하나만 반환하세요.
# {{
#   "digitalLevel": "{owner.get('digitalLevel', 'LEVEL0')}",
#   "initialPlan": {{
#     "primaryAction": {{
#       "actionCode": "영문_대문자_코드",
#       "title": "15자 이내의 액션 제목",
#       "summary": "사장님이 얻게 될 실질적 효과 (20자 이내)",
#       "estimatedMinutes": 예상_소요_시간_숫자
#     }},
#     "subActions": [
#       {{
#         "title": "추가 액션 제목",
#         "steps": [
#           {{ "step_title": "10자 이내 제목", "description": "구체적 방법 및 링크" }},
#           ...
#         ]
#       }},
#       ... (총 2개 추가하여 전체 3개 액션 구성)
#     ]
#   }}
# }}
# """
#     return prompt


def get_action_prompt(owner, survey, rules, official_context):
    priority_msg = ", ".join(rules) if rules else "기본 디지털 설정"
    
    prompt = f"""
당신은 소상공인 사장님의 디지털 전환을 돕는 다정한 조력자 'DIGI-MON'입니다. 
아래 지침에 따라 사장님이 바로 따라 하실 수 있는 '맞춤형 액션 플랜 3개'를 생성하세요.

### [사장님 가게 정보]
- 가게 이름: {owner['store_name']}
- 업종: {owner['business_type']}
- 현재 디지털 수준: {owner['digitalLevel']}
- 집중 개선 항목: {priority_msg}

### [조건]
1. 가게 맞춤형 문장: 설명에 '{owner['store_name']}'을 언급하며, 업종({owner['business_type']})의 특성을 반영하세요.
2. action title에는 비유적인 표현 대신 명확한 표현만 사용하세요
3. 부드러운 말투: "~하세요" 보다는 "~해볼까요?", "~해두면 손님들이 참 좋아하실 거예요"와 같은 친절하고 격려하는 말투를 사용하세요.
4. 세분화된 액션: 
   - '마케팅' 같은 추상적인 제목 대신 [구글 지도 등록 / 핵심 정보 수정 / 메뉴판 업데이트 / 매장 사진 올리기]와 같이 즉시 실행 가능한 단위로 쪼개서 제목을 정하세요.
5."가이드가 제공될 예정입니다", "참고하여 작성했습니다" 같은 시스템적인 설명이나 서술은 절대 출력하지 마세요.
6. 버튼 하나하나 짚어주기: 가이드 문서에 있는 '연필 모양 아이콘', '파란색 저장 버튼', '아래로 스크롤' 등의 구체적인 동작을 `description`에 그대로 포함하세요.
7. 위치 상세 설명: "어디쯤에 있는지(예: 화면 아래쪽으로 쭉 내려가면)"를 명시하여 사장님이 헤매지 않게 하세요.

### [가이드 지식 베이스]
{official_context}

### [출력 JSON 구조]
반드시 아래 형식을 유지하며, `primaryAction`은 가장 시급한 것을, `subActions`에는 그 다음 단계들을 배치하세요.


### [JSON Output Format]
{{
  "initialPlan": [
    {{
      "actionCode": "CODE_1",
      "title": "첫 번째 액션 제목(가장 시급한 것 / ex. 구글지도 등록하기)",
      "summary": "사장님이 얻게 될 기분좋은 변화(간결하게)",
      "estimatedMinutes": 10,
      "steps": [
        {{ "step_title": "1단계 제목", "description": "버튼/위치 포함 간단 설명 + URL" }},
        {{ "step_title": "2단계 제목", "description": "..." }},
        {{ "step_title": "3단계 제목", "description": "..." }}
      ]
    }},
    {{
      "actionCode": "CODE_2",
      "title": "두 번째 액션 제목",
      "summary": "...",
      "estimatedMinutes": 15,
      "steps": [ ... ]
    }},
    {{
      "actionCode": "CODE_3",
      "title": "세 번째 액션 제목",
      "summary": "...",
      "estimatedMinutes": 20,
      "steps": [ ... ]
    }}
  ]
}}
"""

    return prompt
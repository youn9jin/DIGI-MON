"""
prompt.py
시장(Market) 홍보 멘트 및 점포(Store) description 프롬프트 생성 모듈
"""

from typing import Optional


# ─────────────────────────────────────────
# 시장(Market) 홍보 멘트 생성 프롬프트
# ─────────────────────────────────────────

def build_market_promo_prompt(market_info: dict) -> str:
    """
    상인회 입력 데이터를 받아 시장 홍보 멘트 생성 프롬프트를 반환

    Args:
        market_info: {
            "name": 시장 이름,
            "location": 시장 위치/주소,
            "market_type": 시장 유형 (전통시장 / 상점가 / 복합시장),
            "main_categories": 주요 업종 구성 (리스트),
            "total_stores": 총 점포 수,
            "operating_hours": 운영시간,
            "target_customers": 주요 고객층,
            "contact": 대표 연락처 (선택),
            "intro": 시장 한줄 소개 (선택),
            "manager_name": 담당자 이름 (선택),
        }

    Returns:
        Gemini에 전달할 프롬프트 문자열
    """
    name = market_info.get("name", "")
    location = market_info.get("location", "")
    market_type = market_info.get("market_type", "")
    main_categories = ", ".join(market_info.get("main_categories", []))
    total_stores = market_info.get("total_stores", "")
    operating_hours = market_info.get("operating_hours", "")
    target_customers = market_info.get("target_customers", "")
    contact = market_info.get("contact", "")
    intro = market_info.get("intro", "")

    optional_lines = []
    if contact:
        optional_lines.append(f"- 대표 연락처: {contact}")
    if intro:
        optional_lines.append(f"- 시장 한줄 소개: {intro}")
    optional_text = "\n".join(optional_lines) if optional_lines else ""

    prompt = f"""당신은 전통시장 디지털 전환 플랫폼 'DIGI-MON'의 홍보 카피라이터입니다.
아래 시장 정보를 바탕으로 온라인 홍보 멘트를 작성해주세요.

[시장 정보]
- 시장 이름: {name}
- 위치: {location}
- 시장 유형: {market_type}
- 주요 업종: {main_categories}
- 총 점포 수: {total_stores}
- 운영 시간: {operating_hours}
- 주요 고객층: {target_customers}
{optional_text}

[작성 요구사항]
1. 따뜻하고 친근하지만 신뢰감 있는 톤으로 작성
2. 시장의 특색과 주요 업종을 자연스럽게 녹여낼 것
3. 방문을 유도하는 문구 포함
4. 3~4문장, 150자 내외
5. 마케팅 홍보 문구답게 생동감 있게 작성
6. 불필요한 설명 없이 홍보 문구만 출력

반드시 마침표(.)로 끝나는 완전한 문장으로 작성해줘

[출력 형식]
홍보 멘트만 출력 (제목, 부연설명 없이)
"""
    return prompt


# ─────────────────────────────────────────
# 점포(Store) description 생성 프롬프트
# ─────────────────────────────────────────

def build_store_description_prompt(store_info: dict, market_name: Optional[str] = None) -> str:
    """
    STORES 테이블의 점포 데이터를 받아 description 생성 프롬프트를 반환

    Args:
        store_info: {
            "store_id": int,
            "market_id": int,
            "name": 점포명,
            "category": 업종 카테고리,
            "items": 주요 판매 품목,
            "operating_hours": 운영시간,
            "years_of_operation": 운영 연수,
            "contact": 연락처,
        }
        market_name: 해당 점포가 속한 시장 이름 (선택)

    Returns:
        Gemini에 전달할 프롬프트 문자열
    """
    name = store_info.get("name", "")
    category = store_info.get("category", "")
    items = store_info.get("items", "")
    operating_hours = store_info.get("operating_hours", "")
    years_of_operation = store_info.get("years_of_operation", "")
    contact = store_info.get("contact", "")
    market_context = f" ({market_name} 내 위치)" if market_name else ""

    optional_lines = []
    if years_of_operation:
        optional_lines.append(f"- 운영 연수: {years_of_operation}")
    if contact:
        optional_lines.append(f"- 연락처: {contact}")
    optional_text = "\n".join(optional_lines) if optional_lines else ""

    prompt = f"""당신은 전통시장 디지털 플랫폼 'DIGI-MON'의 점포 소개 작성 AI입니다.
아래 점포 정보를 바탕으로 온라인 점포 소개(description)를 작성해주세요.

[점포 정보]
- 점포명: {name}{market_context}
- 업종: {category}
- 주요 판매 품목: {items}
- 운영 시간: {operating_hours}
{optional_text}

[작성 요구사항]
1. 고객이 점포 페이지에서 읽을 소개문 형식
2. 따뜻하고 친근하지만 신뢰감 있는 톤으로 작성
3. 시장의 특색과 주요 업종을 자연스럽게 녹여낼 것
4. 친근하고 신뢰감 있는 톤
5. 점포의 특색과 강점을 자연스럽게 표현
6. 2~3문장, 100자 내외
7. 소개문만 출력 (제목, 부가 설명 없이)

반드시 마침표(.)로 끝나는 완전한 문장으로 작성해줘

[출력 형식]
점포 소개문만 출력
"""
    return prompt

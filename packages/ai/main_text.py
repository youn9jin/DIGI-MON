import os
import json
from datetime import datetime
from gemini_api import generate_text 

# ─────────────────────────────────────────
# 설정 및 타겟 유저 지정
# ─────────────────────────────────────────

TARGET_USER_ID = 101  # 유저ID

MARKET_DATA_FILE = "./data/market_data.json"   
STORES_DATA_FILE = "./data/stores_data.json"   

# ─────────────────────────────────────────
# 데이터 로드 및 저장 함수
# ─────────────────────────────────────────

def load_json(file_path):
    if not os.path.exists(file_path):
        print(f"❌ 에러: {file_path} 파일이 존재하지 않습니다.")
        return None
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_to_json(data, file_path):
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    print(f"💾 {file_path} 파일이 업데이트되었습니다.")

# ─────────────────────────────────────────
# 통합 일괄 생성 로직 (Batch Processing)
# ─────────────────────────────────────────

def process_all_descriptions_at_once(market_data, stores_data, target_user_id):
    print("=" * 60)
    print(f"🚀 [유저 ID: {target_user_id}] 관련 모든 데이터 통합 배치 생성 시작")
    print("=" * 60)

    # 1. 대상 시장 찾기
    target_market = next((m for m in market_data if m.get("user_id") == target_user_id), None)
    if not target_market:
        print(f"❌ 유저 ID({target_user_id})와 매칭되는 시장이 없습니다.")
        return False

    market_id = target_market.get("market_id")
    market_name = target_market.get("name")

    # 2. 해당 시장에 속해있으면서 description이 비어있는 상점들 필터링
    store_list = stores_data.get("stores", stores_data) if isinstance(stores_data, dict) else stores_data
    target_stores = [s for s in store_list if str(s.get("market_id")) == str(market_id) and not s.get("description")]

    if not target_stores and target_market.get("description"):
        print("ℹ️ 이미 시장과 모든 상점의 소개문이 채워져 있습니다. 작업을 건너뜁니다.")
        return False

    # 3. 통합 프롬프트 빌딩
    print(f"📊 대상 시장: {market_name} | 새로 생성할 상점 수: {len(target_stores)}개")
    print("🔄 Gemini API 단일 통합 요청 전송 중 (잠시만 기다려주세요)...")

    batch_prompt = f"""
전통시장 활성화 플랫폼 'DIGI-MON'의 서비스에 필요한 홍보 문구 자동 생성 작업입니다.
요청사항에 맞춰 입력된 JSON 데이터 내의 비어있는 description 필드를 매력적인 문장으로 작성해 주세요.

[작성 지침]
1. 시장 소개글(Market Description): 시장의 메인 카테고리와 타겟 고객층, 특징을 살려 방문하고 싶게 만드는 친근하고 활기찬 어조로 작성해 주세요. (3~4문장 내외)
2. 상점 소개글(Store Description): 상점의 이름, 판매 품목, 개별 특징을 파악하여 소비자의 이목을 끄는 매력적인 마케팅 문구로 작성해 주세요. (2~3문장 내외)
3. 출력 형식: 반드시 마크다운이나 부가 설명 텍스트 없이 오직 순수한 JSON 데이터 포맷만 반환해야 합니다. 코드 블록(```json )도 포함하지 마세요.

[입력 데이터]
- 시장 정보: {json.dumps(target_market, ensure_ascii=False)}
- 생성 대상 상점 리스트: {json.dumps(target_stores, ensure_ascii=False)}

[출력 포맷 가이드]
{{
  "market_description": "여기에 생성된 시장 소개글 작성",
  "stores": [
    {{
      "store_id": "상점아이디(원본과 동일)",
      "description": "여기에 생성된 상점 소개글 작성"
    }}
  ]
}}
"""

    # 한 번에 많은 텍스트를 안정적으로 받아오기 위해 max_output_tokens 확대 조정
    raw_response = generate_text(batch_prompt, temperature=0.7, max_output_tokens=4096)

    if not raw_response:
        print("❌ Gemini API로부터 응답을 받지 못했습니다.")
        return False

    try:
        # 가끔 LLM이 코드 블록 기호를 섞어 출력하는 경우를 대비한 안전 정제 작업
        clean_json_str = raw_response.strip()
        if clean_json_str.startswith("```"):
            clean_json_str = clean_json_str.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        if clean_json_str.startswith("json"):
            clean_json_str = clean_json_str.split("json", 1)[1].strip()

        generated_data = json.loads(clean_json_str)

        # 4. 원본 객체 구조에 데이터 매핑 및 업데이트
        if not target_market.get("description") and "market_description" in generated_data:
            target_market["description"] = generated_data["market_description"]
            target_market["updated_at"] = datetime.now().isoformat()
            print("✅ 시장 소개문 반영 완료")

        gen_stores = generated_data.get("stores", [])
        store_map = {str(s["store_id"]): s["description"] for s in gen_stores if "store_id" in s and "description" in s}

        updated_count = 0
        for store in store_list:
            s_id = str(store.get("store_id"))
            if s_id in store_map:
                store["description"] = store_map[s_id]
                updated_count += 1

        print(f"✅ 총 {updated_count}개 상점의 소개문이 원본 데이터에 통합 매핑되었습니다.")
        return True

    except json.JSONDecodeError:
        print("❌ AI가 유효한 JSON 포맷으로 응답하지 않았습니다. 원본 응답을 확인하세요.")
        print("-" * 40)
        print(raw_response)
        print("-" * 40)
        return False

# ─────────────────────────────────────────
# 엔트리포인트
# ─────────────────────────────────────────

if __name__ == "__main__":
    markets = load_json(MARKET_DATA_FILE)
    stores = load_json(STORES_DATA_FILE)

    if markets and stores:
        # 단 1번의 API 호출로 모든 처리를 수행합니다.
        success = process_all_descriptions_at_once(markets, stores, TARGET_USER_ID)
        
        if success:
            print("=" * 60)
            save_to_json(markets, MARKET_DATA_FILE)
            save_to_json(stores, STORES_DATA_FILE)
            print("\n🎉 일괄 업데이트 파이프라인이 성공적으로 종료되었습니다!")
    else:
        print("❌ 파일 로드 실패")
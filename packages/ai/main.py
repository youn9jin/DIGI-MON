import os
import json
from gemini_api import generate_text 
from prompt import build_market_promo_prompt, build_store_description_prompt

# ─────────────────────────────────────────
# 설정 (파일명 변경)
# ─────────────────────────────────────────

MARKET_DATA_FILE = "./data/market_data.json"   # 시장 정보 파일
STORES_DATA_FILE = "./data/stores_data.json"   # 개별 점포 정보 파일
OUTPUT_FILE = "./data/updated_stores.json"    # 최종 저장될 파일

# ─────────────────────────────────────────
# 데이터 로드 및 저장 함수
# ─────────────────────────────────────────

def load_json(file_path):
    """JSON 파일로부터 데이터를 로드 (공통 함수)"""
    if not os.path.exists(file_path):
        print(f"❌ 에러: {file_path} 파일이 존재하지 않습니다.")
        return None
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_to_json(data, file_path):
    """결과 데이터를 JSON 파일로 저장"""
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    print(f"💾 결과가 {file_path}에 저장되었습니다.")

# ─────────────────────────────────────────
# 실행 로직
# ─────────────────────────────────────────

def run_market_promo(market_info):
    """시장 홍보 멘트 생성"""
    print("=" * 60)
    print("📢 [시장 홍보 멘트 생성]")
    print("=" * 60)
    
    # market_info가 리스트일 경우를 대비해 첫 번째 항목 사용 (혹은 구조에 맞춰 수정)
    info = market_info[0] if isinstance(market_info, list) else market_info
    
    print(f"대상 시장: {info.get('name', '알 수 없음')}")
    print("-" * 60)

    prompt = build_market_promo_prompt(info)
    result = generate_text(prompt, temperature=0.85)

    if result:
        print("✅ 생성된 홍보 멘트:\n")
        print(result)
    else:
        print("❌ 홍보 멘트 생성 실패")
    print()


def run_store_descriptions(stores, market_name):
    """description이 없는 점포들의 소개문 생성"""
    print("=" * 60)
    print("🏪 [점포 description 생성]")
    print("=" * 60)

    # stores가 dict 형태라면 리스트를 추출
    store_list = stores.get("stores", stores) if isinstance(stores, dict) else stores

    target_stores = [s for s in store_list if not s.get("description")]
    skip_stores = [s for s in store_list if s.get("description")]

    print(f"전체: {len(store_list)}개 | 대상: {len(target_stores)}개 | 스킵: {len(skip_stores)}개\n")

    for store in skip_stores:
        print(f"  ⏭️  [{store.get('store_id')}] {store.get('name')} → 스킵")

    for store in target_stores:
        print(f"🔄 [{store.get('store_id')}] {store.get('name')} 생성 중...")
        prompt = build_store_description_prompt(store, market_name=market_name)
        description = generate_text(prompt, temperature=0.5, max_output_tokens=2048)

        if description:
            store["description"] = description
            print(f"✅ 생성 완료: {description[:30]}...")
        else:
            print(f"❌ 생성 실패")
    
    return store_list

# ─────────────────────────────────────────
# 엔트리포인트
# ─────────────────────────────────────────

if __name__ == "__main__":
    # 1. 분리된 JSON 데이터 불러오기
    market_data = load_json(MARKET_DATA_FILE)
    stores_data = load_json(STORES_DATA_FILE)

    if market_data and stores_data:
        # 시장 데이터 구조에 따라 이름 추출 (예: dict 혹은 list)
        market_info = market_data[0] if isinstance(market_data, list) else market_data
        market_name = market_info.get("name", "우리 시장")

        # 2. 시장 홍보 멘트 생성
        run_market_promo(market_info)

        # 3. 점포 description 생성
        updated_stores = run_store_descriptions(stores_data, market_name)

        # 4. 결과 저장
        save_to_json(updated_stores, OUTPUT_FILE)

        print("\n✨ 모든 작업이 완료되었습니다. 'updated_stores.json'을 확인하세요!")
    else:
        print("❌ 데이터 로드 실패로 작업을 중단합니다.")
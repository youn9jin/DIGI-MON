"""
main_web.py
───────────────────────────────────────────────────────────────
DIGI-MON 전통시장 웹사이트 자동 생성 스크립트

동작 방식
  1. market_data.json / stores_data.json 로드
  2. TARGET_USER_ID 에 해당하는 시장·상점 필터링
  3. description 이 비어있는 항목은 Gemini API 로 자동 생성
  4. templates/ 폴더의 HTML 템플릿을 읽어 {{플레이스홀더}} 치환
  5. output_web/ 폴더에 완성된 HTML 파일 저장

생성 파일
  output_web/
    index.html              ← 시장 메인 페이지
    stores.html             ← 가게 목록 페이지
    store_<store_id>.html   ← 개별 가게 상세 페이지 (가게 수만큼)

사전 준비
  - gemini_api.py 에 generate_text() 함수 존재
  - templates/ 폴더에 3개 템플릿 파일 존재
  - data/ 폴더에 market_data.json, stores_data.json 존재
"""

import os
import json
from datetime import datetime
from gemini_api import generate_text  # 기존 Gemini 래퍼 재사용

# ═══════════════════════════════════════════════════════════════
# 설정
# ═══════════════════════════════════════════════════════════════

TARGET_USER_ID = 101  # 웹사이트를 생성할 유저 ID

MARKET_DATA_FILE = "./data/market_data.json"
STORES_DATA_FILE = "./data/stores_data.json"

TEMPLATE_DIR = "./mock_template"
OUTPUT_DIR   = "./output"

TEMPLATE_INDEX  = os.path.join(TEMPLATE_DIR, "index_template.html")
TEMPLATE_STORES = os.path.join(TEMPLATE_DIR, "stores_template.html")
TEMPLATE_DETAIL = os.path.join(TEMPLATE_DIR, "store_detail_template.html")

# ═══════════════════════════════════════════════════════════════
# 유틸리티
# ═══════════════════════════════════════════════════════════════

def load_json(path: str):
    if not os.path.exists(path):
        print(f"❌ 파일 없음: {path}")
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_html(html: str, filename: str):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    path = os.path.join(OUTPUT_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"  💾 저장: {path}")

def load_template(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def parse_json_response(raw: str) -> dict:
    """LLM이 반환한 텍스트에서 JSON 부분만 안전하게 파싱"""
    clean = raw.strip()
    if clean.startswith("```"):
        clean = clean.split("\n", 1)[1] if "\n" in clean else clean[3:]
        clean = clean.rsplit("```", 1)[0]
    clean = clean.removeprefix("json").strip()
    return json.loads(clean)

# ═══════════════════════════════════════════════════════════════
# 공통 HTML 조각 생성
# ═══════════════════════════════════════════════════════════════

def make_emails_html(emails) -> str:
    """이메일 목록 → <p> 태그 문자열"""
    if not emails:
        return "<p>-</p>"
    if isinstance(emails, str):
        emails = [emails]
    return "\n".join(f"<p>{e}</p>" for e in emails)

def make_gallery_html(image_paths: list) -> str:
    """갤러리 이미지 3장 HTML (없으면 placeholder)"""
    items = []
    for i in range(3):
        src = image_paths[i] if i < len(image_paths) else ""
        if src:
            items.append(
                f'<div class="gallery-thumb">'
                f'<img src="{src}" alt="사진{i+1}" /></div>'
            )
        else:
            items.append(
                f'<div class="gallery-thumb" style="display:flex;align-items:center;'
                f'justify-content:center;color:#BBB;font-size:12px;">사진 {i+1}</div>'
            )
    return "\n".join(items)

def make_store_card_html(store: dict) -> str:
    """stores.html 에 들어갈 카드 한 장"""
    sid   = store.get("store_id", "")
    name  = store.get("name", "가게이름")
    cat   = store.get("category", "기타")
    thumb = store.get("thumbnail", "")
    href  = f"store_{sid}.html"

    img_html = (
        f'<img src="{thumb}" alt="{name}" onerror="this.style.display=\'none\'" />'
        if thumb else
        '<div style="width:100%;height:100%;display:flex;align-items:center;'
        'justify-content:center;color:#BBB;font-size:11px;">이미지</div>'
    )

    return (
        f'<a href="{href}" class="store-card" data-category="{cat}">\n'
        f'  <div class="store-thumb">{img_html}</div>\n'
        f'  <div class="store-card-info">\n'
        f'    <p class="store-cat-label">{cat}</p>\n'
        f'    <p class="store-card-name">{name}</p>\n'
        f'  </div>\n'
        f'</a>'
    )

def make_category_buttons(stores: list) -> str:
    """카테고리 필터 버튼 HTML (중복 제거, 순서 유지)"""
    seen = []
    for s in stores:
        cat = s.get("category", "기타")
        if cat not in seen:
            seen.append(cat)
    return "\n".join(
        f'<button class="cat-btn" data-cat="{cat}">{cat}</button>'
        for cat in seen
    )

# ═══════════════════════════════════════════════════════════════
# AI 텍스트 일괄 생성 (배치 1회 호출)
# ═══════════════════════════════════════════════════════════════

def generate_all_texts(market: dict, stores: list) -> dict:
    """
    시장 description + 각 상점 description 이 없는 것만
    Gemini API 단일 호출로 한 번에 생성해 반환.

    반환 형태:
    {
      "market_description": "...",
      "market_hero_desc": "...",
      "market_feature1": {"title":"...", "subtitle":"...", "body":"..."},
      "market_feature2": {"title":"...", "subtitle":"...", "body":"..."},
      "market_directions": "...",
      "stores": [{"store_id": X, "description": "...", "short_desc": "..."}]
    }
    """
    needs_market_desc = not market.get("description", "").strip()
    needs_stores = [s for s in stores if not s.get("description", "").strip()]

    if not needs_market_desc and not needs_stores:
        print("  ℹ️  모든 텍스트가 이미 존재합니다. AI 생성 스킵.")
        return {}

    print(f"  🤖 Gemini API 배치 호출 중 "
          f"(시장: {'생성' if needs_market_desc else '스킵'}, "
          f"상점: {len(needs_stores)}개) ...")

    prompt = f"""
전통시장 활성화 플랫폼 'DIGI-MON'의 홍보 문구 일괄 생성 작업입니다.
아래 JSON 데이터를 참고해 비어있는 description 및 웹페이지 콘텐츠를 작성해 주세요.

[작성 지침]
- 시장 메인 소개(market_description): 3~4문장, 방문하고 싶게 만드는 활기찬 어조
- 히어로 1문장(market_hero_desc): 시장 분위기를 압축한 인상적인 한 문장
- 피처 섹션 1·2(market_feature1/2): 시장의 특색·이야기·볼거리를 나눠 소개
- 찾아오는 길(market_directions): 교통편·주변 정보 포함 2~3문장
- 상점 소개(store description): 2~3문장, 소비자 이목을 끄는 마케팅 문구
- 상점 한줄 소개(store short_desc): 20자 이내의 핵심 문구
- 순수 JSON 만 반환 (마크다운 코드블록, 부가 설명 절대 금지)

[입력 데이터]
시장 정보: {json.dumps(market, ensure_ascii=False)}
description 생성 필요 상점: {json.dumps(needs_stores, ensure_ascii=False)}

[출력 포맷]
{{
  "market_description": "시장 소개글",
  "market_hero_desc":   "시장 히어로 한 문장",
  "market_feature1": {{
    "title":    "섹션 제목 (10자 이내)",
    "subtitle": "부제 (20자 이내)",
    "body":     "본문 3~5문장"
  }},
  "market_feature2": {{
    "title":    "섹션 제목 (10자 이내)",
    "subtitle": "부제 (20자 이내)",
    "body":     "본문 3~5문장"
  }},
  "market_directions": "찾아오는 길 안내 2~3문장",
  "stores": [
    {{
      "store_id":   "상점아이디(원본과 동일)",
      "description":"상점 소개글 2~3문장",
      "short_desc": "한줄 소개 20자 이내"
    }}
  ]
}}
"""
    raw = generate_text(prompt, temperature=0.7, max_output_tokens=4096)
    if not raw:
        print("  ❌ Gemini API 응답 없음.")
        return {}
    try:
        return parse_json_response(raw)
    except json.JSONDecodeError:
        print("  ❌ JSON 파싱 실패. 원본 응답 (처음 300자):")
        print(raw[:300])
        return {}

# ═══════════════════════════════════════════════════════════════
# 데이터 업데이트 (AI 결과 → 원본 dict 반영)
# ═══════════════════════════════════════════════════════════════

def apply_ai_to_data(market: dict, stores: list, ai: dict):
    """AI 생성 텍스트를 market/store 딕셔너리에 직접 반영"""
    if not ai:
        return

    if ai.get("market_description") and not market.get("description"):
        market["description"] = ai["market_description"]
        market["updated_at"]  = datetime.now().isoformat()

    store_map = {
        str(s["store_id"]): s
        for s in ai.get("stores", [])
        if "store_id" in s
    }
    for store in stores:
        sid = str(store.get("store_id", ""))
        if sid in store_map:
            ai_store = store_map[sid]
            if not store.get("description"):
                store["description"] = ai_store.get("description", "")
            if not store.get("short_desc"):
                store["short_desc"] = ai_store.get("short_desc", "")

# ═══════════════════════════════════════════════════════════════
# 페이지 생성 함수
# ═══════════════════════════════════════════════════════════════

def build_index(market: dict, stores: list, ai: dict) -> str:
    """index.html 생성: 템플릿의 {{플레이스홀더}} 를 실제 데이터로 치환"""
    tpl = load_template(TEMPLATE_INDEX)

    name    = market.get("name", "우리 시장")
    address = market.get("address", "-")
    phone   = market.get("phone", "-")
    fax     = market.get("fax", "-")
    emails  = market.get("emails", [])

    hero_desc = (
        ai.get("market_hero_desc")
        or market.get("description")
        or f"{name}에 오신 것을 환영합니다."
    )
    f1 = ai.get("market_feature1") or {}
    f2 = ai.get("market_feature2") or {}
    dir_body = ai.get("market_directions") or market.get("directions_desc") or address

    replacements = {
        "{{MARKET_NAME}}":          name,
        "{{MARKET_IMAGE_SRC}}":     market.get("image", ""),
        "{{FEATURE1_IMAGE_SRC}}":   market.get("feature1_image", ""),
        "{{FEATURE2_IMAGE_SRC}}":   market.get("feature2_image", ""),
        "{{MAP_IMAGE_SRC}}":        market.get("map_image", ""),
        "{{MARKET_HERO_DESC}}":     hero_desc,
        "{{FEATURE1_TITLE}}":       f1.get("title", name),
        "{{FEATURE1_SUBTITLE}}":    f1.get("subtitle", "시장 소개"),
        "{{FEATURE1_BODY}}":        f1.get("body", hero_desc),
        "{{FEATURE2_TITLE}}":       f2.get("title", "시장 이야기"),
        "{{FEATURE2_SUBTITLE}}":    f2.get("subtitle", "우리 시장의 특색"),
        "{{FEATURE2_BODY}}":        f2.get("body", hero_desc),
        "{{MARKET_ADDRESS}}":       address,
        "{{DIRECTIONS_BODY}}":      dir_body,
        "{{MARKET_PHONE}}":         phone,
        "{{MARKET_FAX}}":           fax,
        "{{MARKET_EMAILS_HTML}}":   make_emails_html(emails),
    }
    for k, v in replacements.items():
        tpl = tpl.replace(k, v)
    return tpl


def build_stores(market: dict, stores: list) -> str:
    """stores.html 생성"""
    tpl = load_template(TEMPLATE_STORES)

    name    = market.get("name", "우리 시장")
    address = market.get("address", "-")
    phone   = market.get("phone", "-")
    fax     = market.get("fax", "-")
    emails  = market.get("emails", [])

    cards_html = "\n".join(make_store_card_html(s) for s in stores)
    cat_btns   = make_category_buttons(stores)

    replacements = {
        "{{MARKET_NAME}}":        name,
        "{{MARKET_IMAGE_SRC}}":   market.get("image", ""),
        "{{STORE_COUNT}}":        str(len(stores)),
        "{{CATEGORY_BUTTONS}}":   cat_btns,
        "{{STORE_CARDS_HTML}}":   cards_html,
        "{{MARKET_ADDRESS}}":     address,
        "{{MARKET_PHONE}}":       phone,
        "{{MARKET_FAX}}":         fax,
        "{{MARKET_EMAILS_HTML}}": make_emails_html(emails),
    }
    for k, v in replacements.items():
        tpl = tpl.replace(k, v)
    return tpl


def build_store_detail(market: dict, store: dict) -> str:
    """store_<id>.html 생성"""
    tpl = load_template(TEMPLATE_DETAIL)

    market_name = market.get("name", "우리 시장")
    address     = market.get("address", "-")
    phone       = market.get("phone", "-")
    fax         = market.get("fax", "-")
    emails      = market.get("emails", [])

    store_name   = store.get("name", "상호명")
    category     = store.get("category", "기타")
    description  = store.get("description", "")
    # short_desc: 전용 필드 우선, 없으면 description 첫 문장, 그것도 없으면 가게이름
    raw_short = store.get("short_desc", "")
    if not raw_short:
        first_sentence = description.split(".")[0].strip() if description else ""
        raw_short = first_sentence if first_sentence else store_name
    short_desc   = raw_short  # 자르지 않음 — 템플릿 CSS 가 처리
    hours        = store.get("hours", "영업시간 정보 없음")
    contact      = store.get("contact", "-")
    main_menu    = store.get("main_menu", "-")
    main_img     = store.get("main_image", store.get("image", ""))
    gallery_imgs = store.get("gallery_images", [])

    replacements = {
        "{{MARKET_NAME}}":           market_name,
        "{{STORE_NAME}}":            store_name,
        "{{STORE_CATEGORY}}":        category,
        "{{STORE_SHORT_DESC}}":      short_desc,
        "{{STORE_DESCRIPTION}}":     description,   # ← 전체 소개글 추가
        "{{STORE_MAIN_IMAGE_SRC}}":  main_img,
        "{{STORE_HOURS}}":           hours,
        "{{STORE_CONTACT}}":         contact,
        "{{STORE_MAIN_MENU}}":       main_menu,
        "{{STORE_GALLERY_HTML}}":    make_gallery_html(gallery_imgs),
        "{{MARKET_ADDRESS}}":        address,
        "{{MARKET_PHONE}}":          phone,
        "{{MARKET_FAX}}":            fax,
        "{{MARKET_EMAILS_HTML}}":    make_emails_html(emails),
    }
    for k, v in replacements.items():
        tpl = tpl.replace(k, v)
    return tpl

# ═══════════════════════════════════════════════════════════════
# 엔트리포인트
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("=" * 60)
    print("🌐  DIGI-MON 웹사이트 자동 생성 시작")
    print("=" * 60)

    # ── 1. 데이터 로드 ──────────────────────────────────────────
    markets     = load_json(MARKET_DATA_FILE)
    stores_data = load_json(STORES_DATA_FILE)
    if not markets or not stores_data:
        print("❌ 데이터 로드 실패. 종료합니다.")
        exit(1)

    # ── 2. 대상 시장 추출 ───────────────────────────────────────
    target_market = next(
        (m for m in markets if m.get("user_id") == TARGET_USER_ID), None
    )
    if not target_market:
        print(f"❌ 유저 ID({TARGET_USER_ID})와 매칭되는 시장이 없습니다.")
        exit(1)

    market_id  = target_market.get("market_id")
    store_list = (
        stores_data.get("stores", stores_data)
        if isinstance(stores_data, dict)
        else stores_data
    )
    market_stores = [
        s for s in store_list
        if str(s.get("market_id")) == str(market_id)
    ]

    print(f"✅ 대상 시장: {target_market.get('name')}  |  상점 수: {len(market_stores)}개")

    # ── 3. AI 텍스트 일괄 생성 ──────────────────────────────────
    print("\n📝 [Step 1] AI 텍스트 생성")
    ai_data = generate_all_texts(target_market, market_stores)
    apply_ai_to_data(target_market, market_stores, ai_data)

    # ── 4. HTML 생성 ─────────────────────────────────────────────
    print("\n🏗️  [Step 2] HTML 페이지 생성")

    print("  📄 index.html 생성 중...")
    save_html(build_index(target_market, market_stores, ai_data), "index.html")

    print("  📄 stores.html 생성 중...")
    save_html(build_stores(target_market, market_stores), "stores.html")

    print(f"  📄 개별 가게 페이지 {len(market_stores)}개 생성 중...")
    for store in market_stores:
        sid = store.get("store_id", "unknown")
        save_html(build_store_detail(target_market, store), f"store_{sid}.html")

    # ── 5. 완료 ──────────────────────────────────────────────────
    total = 2 + len(market_stores)
    print("\n" + "=" * 60)
    print(f"🎉 완료! 총 {total}개 HTML 파일이 '{OUTPUT_DIR}/' 에 저장되었습니다.")
    print("   브라우저에서 output_web/index.html 을 열어 확인하세요.")
    print("=" * 60)
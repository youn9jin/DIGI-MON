"""
gemini_api.py
Gemini API 호출 래퍼 모듈 (최신 google-genai 버전)
"""

from google import genai
from typing import Optional

# ─────────────────────────────────────────
# 직접 지정할 API 키
# ─────────────────────────────────────────
MY_API_KEY = "AIzaSyBxB69o0XkfrWSKxOtCr0xLeAvBBcyYjgM"

# 전역 클라이언트 변수 (초기에는 None)
client = None

def configure_gemini(api_key: str = MY_API_KEY) -> None:
    """Gemini 클라이언트 객체 초기화"""
    global client
    if not api_key or not api_key.startswith("AIza"):
        print("⚠️ 유효한 Gemini API 키가 설정되지 않았습니다.")
        return
    
    # 새로운 방식: Client 객체를 생성합니다.
    client = genai.Client(api_key=api_key)

# 파일이 import될 때 자동으로 클라이언트가 생성됩니다.
configure_gemini()

def generate_text(
    prompt: str,
    model_name: str = "gemini-3-flash-preview", # gemini-3-flash 등 최신 모델명 사용 가능
    temperature: float = 0.5,
    max_output_tokens: int = 256,
) -> Optional[str]:
    """
    Gemini 모델을 사용해 텍스트 생성
    """
    global client
    if client is None:
        print("[Gemini API 오류] 클라이언트가 초기화되지 않았습니다.")
        return None

    try:
        # 새로운 방식: client.models.generate_content 호출
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config={
                'temperature': temperature,
                'max_output_tokens': max_output_tokens,
            }
        )
        return response.text.strip()
    except Exception as e:
        print(f"[Gemini API 오류] {e}")
        return None
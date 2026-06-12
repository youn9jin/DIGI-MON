"""
gemini_api.py
Gemini API 호출 래퍼 모듈 (최신 google-genai 버전)
"""

import os
from google import genai
from typing import Optional

# 전역 클라이언트 변수
client = None

def configure_gemini(api_key: Optional[str] = None) -> None:
    """
    Gemini 클라이언트 객체 초기화
    1. 인자로 api_key가 들어오면 우선 사용 (터미널 입력 등)
    2. 인자가 없으면 시스템 환경변수 'GEMINI_API_KEY'에서 탐색
    """
    global client
    
    # 1) 인자로 받은 키가 없으면 환경변수에서 가져옴
    if not api_key:
        api_key = os.getenv("GEMINI_API_KEY")
        
    if not api_key or not api_key.startswith("AIza"):
        print("⚠️ 유효한 Gemini API 키가 설정되지 않았습니다.")
        print("💡 터미널에 'export GEMINI_API_KEY=\"내_키\"'를 설정하거나 코드 호출 시 키를 전달해주세요.")
        return
    
    # Client 객체 생성
    client = genai.Client(api_key=api_key)
    print("✅ Gemini 클라이언트가 성공적으로 초기화되었습니다.")

# 기본적으로 환경변수를 찾아 초기화 시도
configure_gemini()

def generate_text(
    prompt: str,
    model_name: str = "gemini-2.5-flash", 
    temperature: float = 0.5,
    max_output_tokens: int = 2048,
) -> Optional[str]:
    """
    Gemini 모델을 사용해 텍스트 생성
    """
    global client
    if client is None:
        print("[Gemini API 오류] 클라이언트가 초기화되지 않았습니다.")
        return None

    try:
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

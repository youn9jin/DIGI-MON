#!/usr/bin/env python3
"""
AI 단독 호출 + 백엔드 연동 자동 테스트.
실행: python test_integration.py
"""
import json
import sys

try:
    import urllib.request
    import urllib.error
except ImportError:
    import urllib.request
    import urllib.error

AI_URL = "http://localhost:8001/internal/plan/generate"
BACKEND_URL = "http://localhost:8080/api/plan-drafts"

AI_BODY = {
    "requestId": "test-prelogin-001",
    "stage": "PRE_LOGIN",
    "locale": "ko-KR",
    "digitalLevel": "LEVEL0",
    "survey": {
        "q1MapSearchable": "NOT_FOUND",
        "q2MapInfoAccurate": "NONE_OR_UNKNOWN",
        "q3MenuVisible": "BARELY",
        "q4ContactChannel": "NO_CHANNEL",
        "q5PrimaryGoal": "INCREASE_ACCESSIBILITY",
    },
}

BACKEND_BODY = {
    "survey": {
        "q1MapSearchable": "NOT_FOUND",
        "q2MapInfoAccurate": "NONE_OR_UNKNOWN",
        "q3MenuVisible": "BARELY",
        "q4ContactChannel": "NO_CHANNEL",
        "q5PrimaryGoal": "INCREASE_ACCESSIBILITY",
    }
}


def post_json(url, body):
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            return res.getcode(), res.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8") if e.fp else ""
    except Exception as e:
        return None, str(e)


def test_ai_standalone():
    print("=" * 60)
    print("1) AI 서버 단독 호출 테스트")
    print("   POST", AI_URL)
    print("=" * 60)
    code, raw = post_json(AI_URL, AI_BODY)
    print("HTTP Status:", code)
    print("Response body:")
    try:
        body = json.loads(raw) if raw else {}
        print(json.dumps(body, indent=2, ensure_ascii=False))
    except Exception:
        print(raw or "(empty)")

    ok = True
    msg = []
    if code != 200:
        ok = False
        msg.append(f"HTTP status가 200이 아님: {code}")
    else:
        try:
            data = json.loads(raw)
            initial_plan = data.get("initialPlan") if isinstance(data.get("initialPlan"), list) else data.get("data", {}).get("initialPlan")
            if not isinstance(initial_plan, list):
                ok = False
                msg.append("initialPlan이 배열이 아님")
            elif len(initial_plan) == 0:
                ok = False
                msg.append("initialPlan이 빈 배열")
            else:
                first = initial_plan[0]
                if "actionCode" not in first:
                    ok = False
                    msg.append("첫 번째 action에 actionCode 없음")
                if "title" not in first:
                    ok = False
                    msg.append("첫 번째 action에 title 없음")
                if "steps" not in first:
                    ok = False
                    msg.append("첫 번째 action에 steps 없음")
                else:
                    steps = first["steps"]
                    if steps and "step_title" not in steps[0]:
                        ok = False
                        msg.append("steps[0]에 step_title 없음")
        except Exception as e:
            ok = False
            msg.append(f"응답 파싱/검증 예외: {e}")

    if msg:
        print("검증:", "; ".join(msg))
    print("결과:", "성공" if ok else "실패")
    return ok


def test_backend_integration():
    print()
    print("=" * 60)
    print("2) 백엔드 → AI 연동 테스트")
    print("   POST", BACKEND_URL)
    print("=" * 60)
    code, raw = post_json(BACKEND_URL, BACKEND_BODY)
    print("HTTP Status:", code)
    print("Response body (일부):")
    try:
        body = json.loads(raw) if raw else {}
        print(json.dumps(body, indent=2, ensure_ascii=False)[:2000])
        if len(json.dumps(body)) > 2000:
            print("... (생략)")
    except Exception:
        print(raw or "(empty)")

    ok = True
    msg = []
    if code != 201:
        ok = False
        msg.append(f"HTTP status가 201이 아님: {code}")
    else:
        try:
            data = json.loads(raw)
            if data.get("success") is not True:
                ok = False
                msg.append("success가 true가 아님")
            initial_plan = (data.get("data") or {}).get("initialPlan")
            if not isinstance(initial_plan, list):
                ok = False
                msg.append("data.initialPlan이 배열이 아님")
            elif len(initial_plan) == 0:
                ok = False
                msg.append("data.initialPlan이 빈 배열")
            else:
                first = initial_plan[0]
                steps = first.get("steps") or []
                if not steps:
                    ok = False
                    msg.append("data.initialPlan[0].steps가 없거나 비어 있음")
                elif "step_title" not in steps[0]:
                    ok = False
                    msg.append("data.initialPlan[0].steps[0].step_title 없음")
        except Exception as e:
            ok = False
            msg.append(f"응답 파싱/검증 예외: {e}")

    if msg:
        print("검증:", "; ".join(msg))
    print("결과:", "성공" if ok else "실패")
    return ok


def main():
    r1 = test_ai_standalone()
    r2 = test_backend_integration()

    print()
    print("=" * 60)
    print("3) 결과 요약")
    print("=" * 60)
    print("AI 단독 호출:    ", "성공" if r1 else "실패")
    print("백엔드 연동:     ", "성공" if r2 else "실패")
    if not r1:
        print("  → 실패 구간: 1) AI 서버 단독 호출 (POST /internal/plan/generate)")
    if not r2:
        print("  → 실패 구간: 2) 백엔드 → AI 연동 (POST /api/plan-drafts)")
    print("=" * 60)
    sys.exit(0 if (r1 and r2) else 1)


if __name__ == "__main__":
    main()

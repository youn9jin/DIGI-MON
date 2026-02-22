def get_priority_rules(survey):
    """
    서버 명세 Enum 값을 기반으로 우선순위 규칙과 점수를 결정합니다.
    """
    priorities = []

    # Q5: 사장님의 핵심 목표
    goal = survey.get('q5_primary_goal', 'NOT_SURE')

    # 1. 구글 지도 등록 (Q1: MAP_SEARCHABLE)
    q1 = survey.get('q1_map_searchable')
    if q1 in ['NOT_FOUND', 'NOT_SURE']:
        # 접근성 높이기가 목표라면 가중치 부여
        score = 100 if goal == 'INCREASE_ACCESSIBILITY' else 90
        priorities.append({
            "target": "MAP_REG",
            "rule": "구글 지도 상점 신규 등록 및 위치 최적화",
            "score": score
        })

    # 2. 정보 수정 (Q2: MAP_INFO_ACCURATE)
    q2 = survey.get('q2_map_info_accurate')
    if q2 in ['PARTIAL_OR_WRONG', 'NONE_OR_UNKNOWN']:
        priorities.append({
            "target": "MAP_INFO",
            "rule": "구글 비즈니스 프로필 정보(시간, 연락처) 최신화",
            "score": 85
        })

    # 3. 메뉴 및 사진 최적화 (Q3: MENU_VISIBLE)
    q3 = survey.get('q3_menu_visible')
    if q3 in ['SOME', 'BARELY']:
        # 가게를 좋아 보이게 하는 것이 목표라면 가중치 부여
        score = 80 if goal == 'LOOK_BETTER' else 70
        priorities.append({
            "target": "CONTENT",
            "rule": "구글 메뉴 사진 업데이트 및 상세 설명 추가",
            "score": score
        })

    # 4. 연락 채널 및 시스템 (Q4: CONTACT_CHANNEL)
    q4 = survey.get('q4_contact_channel')
    if q4 in ['NO_CHANNEL', 'NOT_SURE']:
        # 연락이 잘 오게 하는 것이 목표라면 가중치 부여
        score = 75 if goal == 'GET_MORE_CONTACTS' else 60
        priorities.append({
            "target": "CONTACT",
            "rule": "인스타그램 비즈니스 계정 연결 및 연락처 활성화",
            "score": score
        })

    # 점수 기준 내림차순 정렬
    sorted_priorities = sorted(priorities, key=lambda x: x['score'], reverse=True)

    return [p['rule'] for p in sorted_priorities]

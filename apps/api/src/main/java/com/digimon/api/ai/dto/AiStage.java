package com.digimon.api.ai.dto;

/**
 * AI 플랜 생성 단계.
 * PRE_LOGIN → initialPlan 생성, FINALIZE → finalPlan 생성(추후 확장).
 */
public enum AiStage {
    PRE_LOGIN,
    FINALIZE
}

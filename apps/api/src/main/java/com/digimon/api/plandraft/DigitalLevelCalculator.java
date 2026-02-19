package com.digimon.api.plandraft;

import com.digimon.api.plandraft.dto.SurveyDto;
import com.digimon.api.plandraft.survey.*;

/**
 * 설문 응답 기준 디지털 레벨 산정.
 * Level3 if Q4 == HAS_CHANNEL
 * else Level2 if Q3 in {ENOUGH, SOME}
 * else Level1 if (Q1 == EASY_FOUND) OR (Q2 == ALL_CORRECT)
 * else Level0
 */
public final class DigitalLevelCalculator {

    private DigitalLevelCalculator() {}

    public static DigitalLevel calculate(SurveyDto survey) {
        if (survey.getQ4ContactChannel() == Q4ContactChannel.HAS_CHANNEL) {
            return DigitalLevel.LEVEL3;
        }
        if (survey.getQ3MenuVisible() == Q3MenuVisible.ENOUGH || survey.getQ3MenuVisible() == Q3MenuVisible.SOME) {
            return DigitalLevel.LEVEL2;
        }
        if (survey.getQ1MapSearchable() == Q1MapSearchable.EASY_FOUND
                || survey.getQ2MapInfoAccurate() == Q2MapInfoAccurate.ALL_CORRECT) {
            return DigitalLevel.LEVEL1;
        }
        return DigitalLevel.LEVEL0;
    }
}

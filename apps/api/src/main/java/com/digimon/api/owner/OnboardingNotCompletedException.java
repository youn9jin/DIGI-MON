package com.digimon.api.owner;

public class OnboardingNotCompletedException extends RuntimeException {

    public OnboardingNotCompletedException() {
        super("Owner onboarding must be completed before finalize");
    }
}

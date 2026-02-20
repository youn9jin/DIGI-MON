package com.digimon.api.plandraft;

public class DraftNotFoundException extends RuntimeException {

    public DraftNotFoundException(Long draftId) {
        super("Plan draft not found: " + draftId);
    }
}

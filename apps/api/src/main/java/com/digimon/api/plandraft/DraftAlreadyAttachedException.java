package com.digimon.api.plandraft;

public class DraftAlreadyAttachedException extends RuntimeException {

    public DraftAlreadyAttachedException() {
        super("Draft is already attached to another user");
    }
}

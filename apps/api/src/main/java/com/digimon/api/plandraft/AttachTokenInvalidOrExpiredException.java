package com.digimon.api.plandraft;

public class AttachTokenInvalidOrExpiredException extends RuntimeException {

    public AttachTokenInvalidOrExpiredException() {
        super("Attach token is invalid, expired, or already used");
    }
}

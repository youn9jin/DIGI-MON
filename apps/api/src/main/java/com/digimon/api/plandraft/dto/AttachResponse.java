package com.digimon.api.plandraft.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AttachResponse {

    private long draftId;
    private boolean attached;
}

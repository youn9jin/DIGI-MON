package com.digimon.api.global;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResponseWrapper<T> {

    private boolean success;
    private T data;
    private ErrorBody error;

    public static <T> ResponseWrapper<T> success(T data) {
        return new ResponseWrapper<>(true, data, null);
    }

    public static <T> ResponseWrapper<T> error(String code, String message, Object details) {
        return new ResponseWrapper<>(false, null, new ErrorBody(code, message, details));
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ErrorBody {
        private String code;
        private String message;
        private Object details;
    }
}

package com.digimon.api.marketpage;

/**
 * content_json 파싱 실패 시 사용.
 * GlobalExceptionHandler 에서 500 INTERNAL_SERVER_ERROR + code "CONTENT_PARSE_ERROR" 로 매핑한다.
 */
public class ContentParseErrorException extends RuntimeException {

    public ContentParseErrorException(String message) {
        super(message);
    }

    public ContentParseErrorException(String message, Throwable cause) {
        super(message, cause);
    }
}

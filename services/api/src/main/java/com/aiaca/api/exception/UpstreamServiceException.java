package com.aiaca.api.exception;

import org.springframework.http.HttpStatus;

public class UpstreamServiceException extends RuntimeException {
    private final HttpStatus status;

    public UpstreamServiceException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public UpstreamServiceException(String message, HttpStatus status, Throwable cause) {
        super(message, cause);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}

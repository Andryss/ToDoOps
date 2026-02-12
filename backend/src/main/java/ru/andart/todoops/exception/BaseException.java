package ru.andart.todoops.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * Base exception for API error handling.
 * Contains error code, text identifier, and human-readable message.
 */
@Getter
@Builder
@AllArgsConstructor
public class BaseException extends RuntimeException {

    private final int code;
    private final String message;
    private final String humanMessage;
}

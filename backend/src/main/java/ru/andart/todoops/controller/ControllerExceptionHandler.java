package ru.andart.todoops.controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import ru.andart.todoops.exception.BaseException;
import ru.andart.todoops.exception.Errors;
import ru.andart.todoops.generated.model.ErrorObject;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.http.HttpStatus.NOT_FOUND;

/**
 * Global exception handler for REST API.
 * Converts exceptions to standardized ErrorObject responses.
 */
@Slf4j
@RestControllerAdvice
public class ControllerExceptionHandler {

    /**
     * Handles BaseException and returns ErrorObject.
     */
    @ExceptionHandler(BaseException.class)
    public ErrorObject handleBaseException(BaseException ex, HttpServletResponse response) {
        log.warn("BaseException: code={}, message={}", ex.getCode(), ex.getMessage());
        response.setStatus(ex.getCode());
        return createErrorObject(ex);
    }

    /**
     * Handles method argument validation errors (e.g. @Valid on request body).
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(BAD_REQUEST)
    public ErrorObject handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        FieldError fieldError = ex.getBindingResult().getFieldError();
        String message = fieldError != null ? fieldError.getDefaultMessage() : "Validation error";
        log.warn("Validation error: {}", message);
        return createErrorObject(Errors.validationError(message));
    }

    /**
     * Handles constraint violation (e.g. @Valid on path/query params).
     */
    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(BAD_REQUEST)
    public ErrorObject handleConstraintViolation(ConstraintViolationException ex) {
        log.warn("Constraint violation: {}", ex.getMessage());
        return createErrorObject(Errors.validationError(ex.getMessage()));
    }

    /**
     * Handles NoResourceFoundException (e.g. static resource or path not found).
     */
    @ExceptionHandler(NoResourceFoundException.class)
    @ResponseStatus(NOT_FOUND)
    public ErrorObject handleNoResourceFound(NoResourceFoundException ex) {
        log.warn("Resource not found: {}", ex.getResourcePath());
        return createErrorObject(Errors.notFound());
    }

    /**
     * Handles all other unhandled exceptions.
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(INTERNAL_SERVER_ERROR)
    public ErrorObject handleException(Exception ex) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        return createErrorObject(Errors.unhandledExceptionError());
    }

    private static ErrorObject createErrorObject(BaseException ex) {
        return new ErrorObject()
                .code(ex.getCode())
                .message(ex.getMessage())
                .humanMessage(ex.getHumanMessage());
    }
}

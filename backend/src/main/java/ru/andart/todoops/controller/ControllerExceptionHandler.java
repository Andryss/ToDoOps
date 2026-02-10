package ru.andart.todoops.controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.ConstraintViolationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import ru.andart.todoops.exception.BaseException;
import ru.andart.todoops.exception.Errors;
import ru.andart.todoops.generated.model.ErrorObject;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

/**
 * Global exception handler for REST API.
 * Converts exceptions to standardized ErrorObject responses.
 */
@RestControllerAdvice
public class ControllerExceptionHandler {

    /**
     * Handles BaseException and returns ErrorObject.
     */
    @ExceptionHandler(BaseException.class)
    public ErrorObject handleBaseException(BaseException ex, HttpServletResponse response) {
        response.setStatus(ex.getCode());
        return createErrorObject(ex);
    }

    /**
     * Handles method argument validation errors (e.g. @Valid on request body).
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(BAD_REQUEST)
    public ErrorObject handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        var fieldError = ex.getBindingResult().getFieldError();
        String message = fieldError != null ? fieldError.getDefaultMessage() : "Validation error";
        return createErrorObject(Errors.validationError(message));
    }

    /**
     * Handles constraint violation (e.g. @Valid on path/query params).
     */
    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(BAD_REQUEST)
    public ErrorObject handleConstraintViolation(ConstraintViolationException ex) {
        return createErrorObject(Errors.validationError(ex.getMessage()));
    }

    /**
     * Handles all other unhandled exceptions.
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(INTERNAL_SERVER_ERROR)
    public ErrorObject handleException(Exception ex) {
        return createErrorObject(Errors.unhandledExceptionError());
    }

    private static ErrorObject createErrorObject(BaseException ex) {
        return new ErrorObject()
                .code(ex.getCode())
                .message(ex.getMessage())
                .humanMessage(ex.getHumanMessage());
    }
}

package ru.andart.todoops.exception;

/**
 * Class describing all errors that occur in the application.
 */
public final class Errors {

    private Errors() {
    }

    /**
     * Task not found by id.
     */
    public static BaseException taskNotFoundError(Long id) {
        return new BaseException(400, "task.not_found", "Task not found: " + id);
    }

    /**
     * Invalid status transition.
     */
    public static BaseException invalidStatusTransitionError(String current, String target) {
        String humanMessage = String.format("Invalid status transition from %s to %s", current, target);
        return new BaseException(400, "task.invalid_status_transition", humanMessage);
    }

    /**
     * Validation error.
     */
    public static BaseException validationError(String message) {
        return new BaseException(400, "validation.error", message != null ? message : "Validation error");
    }

    /**
     * Unexpected unhandled error.
     */
    public static BaseException unhandledExceptionError() {
        return new BaseException(500, "internal.error", "Something went wrong...");
    }
}

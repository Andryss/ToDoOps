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
        return BaseException.builder()
                .code(400)
                .message("task.not_found")
                .humanMessage("Task not found: " + id)
                .build();
    }

    /**
     * Invalid status transition.
     */
    public static BaseException invalidStatusTransitionError(String current, String target) {
        String humanMessage = String.format("Invalid status transition from %s to %s", current, target);
        return BaseException.builder()
                .code(400)
                .message("task.invalid_status_transition")
                .humanMessage(humanMessage)
                .build();
    }

    /**
     * Validation error.
     */
    public static BaseException validationError(String message) {
        return BaseException.builder()
                .code(400)
                .message("validation.error")
                .humanMessage(message != null ? message : "Validation error")
                .build();
    }

    /**
     * Unexpected unhandled error.
     */
    public static BaseException unhandledExceptionError() {
        return BaseException.builder()
                .code(500)
                .message("internal.error")
                .humanMessage("Something went wrong...")
                .build();
    }
}

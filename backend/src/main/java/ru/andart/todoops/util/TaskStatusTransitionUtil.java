package ru.andart.todoops.util;

import ru.andart.todoops.generated.model.TaskStatus;

import java.util.Collections;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Utility for task status transition rules.
 * Allowed flow: NEW -> IN_PROGRESS -> COMPLETED.
 */
public final class TaskStatusTransitionUtil {

    private static final Map<TaskStatus, Set<TaskStatus>> ALLOWED_TRANSITIONS = Map.of(
            TaskStatus.NEW, EnumSet.of(TaskStatus.IN_PROGRESS),
            TaskStatus.IN_PROGRESS, EnumSet.of(TaskStatus.COMPLETED),
            TaskStatus.COMPLETED, Collections.emptySet()
    );

    private TaskStatusTransitionUtil() {
    }

    /**
     * Checks if transition from current status to target status is allowed.
     * Same status (no change) is always allowed.
     *
     * @param from current status
     * @param to   target status
     * @return true if transition is allowed
     */
    public static boolean isTransitionAllowed(TaskStatus from, TaskStatus to) {
        if (from == to) {
            return true;
        }
        return ALLOWED_TRANSITIONS.getOrDefault(from, Collections.emptySet()).contains(to);
    }
}

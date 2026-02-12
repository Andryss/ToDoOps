package ru.andart.todoops.converter;

import org.springframework.stereotype.Component;
import ru.andart.todoops.entity.TaskEntity;
import ru.andart.todoops.generated.model.TaskResponse;

/**
 * Converts {@link TaskEntity} to API response DTOs.
 */
@Component
public class TaskConverter {

    /**
     * Converts task entity to TaskResponse.
     *
     * @param entity task entity
     * @return task response for API
     */
    public TaskResponse toResponse(TaskEntity entity) {
        String description = entity.getDescription() != null ? entity.getDescription() : "";
        return new TaskResponse()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(description)
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .dueDate(entity.getDueDate());
    }
}

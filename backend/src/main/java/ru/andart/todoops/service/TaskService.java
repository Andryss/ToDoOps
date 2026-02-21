package ru.andart.todoops.service;

import java.time.OffsetDateTime;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import ru.andart.todoops.entity.TaskEntity;
import ru.andart.todoops.exception.BaseException;
import ru.andart.todoops.exception.Errors;
import ru.andart.todoops.generated.model.TaskCreateRequest;
import ru.andart.todoops.generated.model.TaskStatus;
import ru.andart.todoops.generated.model.TaskStatusRequest;
import ru.andart.todoops.generated.model.TaskUpdateRequest;
import ru.andart.todoops.repository.TaskRepository;
import ru.andart.todoops.util.TaskStatusTransitionUtil;

/**
 * Business logic for task CRUD operations.
 * Uses {@link TransactionTemplate} for manual transaction boundaries.
 */
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final TransactionTemplate transactionTemplate;
    private final TransactionTemplate readOnlyTransactionTemplate;

    /**
     * Creates a new task in NEW status
     *
     * @param request create request (title and description required; status is not accepted, always NEW)
     * @return created task entity
     */
    public TaskEntity create(TaskCreateRequest request) {
        return transactionTemplate.execute(status -> {
            TaskEntity entity = TaskEntity.builder()
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .status(TaskStatus.NEW)
                    .createdAt(OffsetDateTime.now())
                    .dueDate(request.getDueDate())
                    .build();
            return taskRepository.save(entity);
        });
    }

    /**
     * Returns a page of tasks.
     *
     * @param page zero-based page index
     * @param size page size
     * @return page of task entities
     */
    public Page<TaskEntity> list(int page, int size) {
        return readOnlyTransactionTemplate.execute(status ->
                taskRepository.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"))));
    }

    /**
     * Returns a task by id.
     *
     * @param id task id
     * @return task entity
     * @throws BaseException if task not found
     */
    public TaskEntity getById(Long id) {
        return readOnlyTransactionTemplate.execute(status ->
                taskRepository.findById(id).orElseThrow(() -> Errors.taskNotFoundError(id)));
    }

    /**
     * Updates task fields (only non-null fields from request).
     *
     * @param id task id
     * @param request update request
     * @return updated task entity
     * @throws BaseException if task not found
     */
    public TaskEntity update(Long id, TaskUpdateRequest request) {
        return transactionTemplate.execute(status -> {
            TaskEntity entity = taskRepository.findById(id)
                    .orElseThrow(() -> Errors.taskNotFoundError(id));
            if (request.getTitle() != null) {
                entity.setTitle(request.getTitle());
            }
            if (request.getDescription() != null) {
                entity.setDescription(request.getDescription());
            }
            if (request.getDueDate() != null) {
                entity.setDueDate(request.getDueDate());
            }
            return taskRepository.save(entity);
        });
    }

    /**
     * Deletes a task by id.
     *
     * @param id task id
     * @throws BaseException if task not found
     */
    public void delete(Long id) {
        transactionTemplate.executeWithoutResult(status -> {
            if (!taskRepository.existsById(id)) {
                throw Errors.taskNotFoundError(id);
            }
            taskRepository.deleteById(id);
        });
    }

    /**
     * Changes task status. Only allowed transitions: NEW -> IN_PROGRESS -> COMPLETED.
     * If already in target status, returns current task (OK).
     *
     * @param id task id
     * @param request target status
     * @return task entity (possibly unchanged if already in target status)
     * @throws BaseException if task not found or transition not allowed
     */
    public TaskEntity changeStatus(Long id, TaskStatusRequest request) {
        return transactionTemplate.execute(status -> {
            TaskEntity entity = taskRepository.findById(id)
                    .orElseThrow(() -> Errors.taskNotFoundError(id));
            TaskStatus current = entity.getStatus();
            TaskStatus target = request.getStatus();

            if (current == target) {
                return entity;
            }

            if (!TaskStatusTransitionUtil.isTransitionAllowed(current, target)) {
                throw Errors.invalidStatusTransitionError(current.name(), target.name());
            }

            entity.setStatus(target);
            return taskRepository.save(entity);
        });
    }
}

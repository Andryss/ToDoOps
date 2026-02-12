package ru.andart.todoops.controller;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.RestController;
import ru.andart.todoops.converter.TaskConverter;
import ru.andart.todoops.entity.TaskEntity;
import ru.andart.todoops.generated.api.TasksApi;
import ru.andart.todoops.generated.model.TaskCreateRequest;
import ru.andart.todoops.generated.model.TaskPageResponse;
import ru.andart.todoops.generated.model.TaskResponse;
import ru.andart.todoops.generated.model.TaskStatusRequest;
import ru.andart.todoops.generated.model.TaskUpdateRequest;
import ru.andart.todoops.service.TaskService;

import java.util.List;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;

/**
 * REST controller for task API. Logs each request.
 */
@Slf4j
@RestController
public class TasksApiImpl implements TasksApi {

    private final TaskService taskService;
    private final TaskConverter taskConverter;

    public TasksApiImpl(TaskService taskService, TaskConverter taskConverter) {
        this.taskService = taskService;
        this.taskConverter = taskConverter;
    }

    @Override
    public TaskResponse createTask(TaskCreateRequest taskCreateRequest) {
        log.info("POST /api/v1/tasks createTask title={}", taskCreateRequest.getTitle());
        return taskConverter.toResponse(taskService.create(taskCreateRequest));
    }

    @Override
    public TaskPageResponse listTasks(Integer page, Integer size) {
        log.info("GET /api/v1/tasks listTasks page={} size={}", page, size);
        Page<TaskEntity> slice = taskService.list(page, size);
        List<TaskResponse> content = slice.getContent().stream()
                .map(taskConverter::toResponse)
                .collect(Collectors.toList());
        return new TaskPageResponse()
                .content(content)
                .totalElements(slice.getTotalElements())
                .totalPages(slice.getTotalPages())
                .size(size)
                .number(page);
    }

    @Override
    public TaskResponse getTask(Long id) {
        log.info("GET /api/v1/tasks/{} getTask", id);
        return taskConverter.toResponse(taskService.getById(id));
    }

    @Override
    public TaskResponse updateTask(Long id, TaskUpdateRequest taskUpdateRequest) {
        log.info("PUT /api/v1/tasks/{} updateTask", id);
        return taskConverter.toResponse(taskService.update(id, taskUpdateRequest));
    }

    @Override
    public void deleteTask(Long id) {
        log.info("DELETE /api/v1/tasks/{} deleteTask", id);
        taskService.delete(id);
    }

    @Override
    public TaskResponse changeTaskStatus(Long id, TaskStatusRequest taskStatusRequest) {
        log.info("PATCH /api/v1/tasks/{}/status changeTaskStatus status={}", id, taskStatusRequest.getStatus());
        return taskConverter.toResponse(taskService.changeStatus(id, taskStatusRequest));
    }
}

package ru.andart.todoops.controller;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.SneakyThrows;
import org.junit.jupiter.api.Test;
import org.springframework.test.json.JsonCompareMode;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * API tests for task endpoints (create, list, get, update, delete, changeStatus).
 */
class TasksApiTest extends BaseApiTest {

    @Test
    @SneakyThrows
    void createTaskReturns200WithNewStatus() {
        String expectedJson = """
                {
                    "title": "First task",
                    "description": "Description of first task",
                    "status": "NEW",
                    "due_date": null
                }
                """;
        mockMvc.perform(post("/api/v1/tasks")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                    "title": "First task",
                                    "description": "Description of first task"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(content().json(expectedJson, JsonCompareMode.LENIENT));
    }

    @Test
    @SneakyThrows
    void listTasksReturnsPagedResponse() {
        String expectedJson = """
                {
                    "content": [],
                    "totalElements": 0,
                    "totalPages": 0,
                    "size": 20,
                    "number": 0
                }
                """;
        mockMvc.perform(get("/api/v1/tasks")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(content().json(expectedJson, JsonCompareMode.LENIENT));
    }

    @Test
    @SneakyThrows
    void getTaskAfterCreateReturnsTask() {
        Long id = createTaskAndReturnId("Get me", "Desc");

        String expectedJson = """
                {
                    "id": %d,
                    "title": "Get me",
                    "description": "Desc",
                    "status": "NEW",
                    "due_date": null
                }
                """.formatted(id);
        mockMvc.perform(get("/api/v1/tasks/{id}", id))
                .andExpect(status().isOk())
                .andExpect(content().json(expectedJson, JsonCompareMode.LENIENT));
    }

    @Test
    @SneakyThrows
    void getTaskNotFoundReturns400() {
        String expectedJson = """
                {
                    "code": 400,
                    "message": "task.not_found",
                    "humanMessage": "Task not found: 99999"
                }
                """;
        mockMvc.perform(get("/api/v1/tasks/99999"))
                .andExpect(status().isBadRequest())
                .andExpect(content().json(expectedJson, JsonCompareMode.LENIENT));
    }

    @Test
    @SneakyThrows
    void updateTaskReturnsUpdatedTask() {
        Long id = createTaskAndReturnId("Original", "Original desc");

        String expectedPutJson = """
                {
                    "id": %d,
                    "title": "Updated title",
                    "description": "Updated description",
                    "status": "NEW",
                    "due_date": null
                }
                """.formatted(id);
        mockMvc.perform(put("/api/v1/tasks/{id}", id)
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                    "title": "Updated title",
                                    "description": "Updated description"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(content().json(expectedPutJson, JsonCompareMode.LENIENT));

        String expectedGetJson = """
                {
                    "id": %d,
                    "title": "Updated title",
                    "description": "Updated description",
                    "status": "NEW",
                    "due_date": null
                }
                """.formatted(id);
        mockMvc.perform(get("/api/v1/tasks/{id}", id))
                .andExpect(status().isOk())
                .andExpect(content().json(expectedGetJson, JsonCompareMode.LENIENT));
    }

    @Test
    @SneakyThrows
    void deleteTaskThenGetReturns400() {
        Long id = createTaskAndReturnId("To delete", "Desc");

        mockMvc.perform(delete("/api/v1/tasks/{id}", id))
                .andExpect(status().isOk());

        String expectedJson = """
                {
                    "code": 400,
                    "message": "task.not_found",
                    "humanMessage": "Task not found: %d"
                }
                """.formatted(id);
        mockMvc.perform(get("/api/v1/tasks/{id}", id))
                .andExpect(status().isBadRequest())
                .andExpect(content().json(expectedJson, JsonCompareMode.LENIENT));
    }

    @Test
    @SneakyThrows
    void changeTaskStatusNewToInProgressThenToCompleted() {
        Long id = createTaskAndReturnId("Status task", "Desc");

        String inProgressJson = """
                {
                    "id": %d,
                    "title": "Status task",
                    "description": "Desc",
                    "status": "IN_PROGRESS",
                    "due_date": null
                }
                """.formatted(id);
        mockMvc.perform(patch("/api/v1/tasks/{id}/status", id)
                        .contentType(APPLICATION_JSON)
                        .content("{\"status\": \"IN_PROGRESS\"}"))
                .andExpect(status().isOk())
                .andExpect(content().json(inProgressJson, JsonCompareMode.LENIENT));

        String completedJson = """
                {
                    "id": %d,
                    "title": "Status task",
                    "description": "Desc",
                    "status": "COMPLETED",
                    "due_date": null
                }
                """.formatted(id);
        mockMvc.perform(patch("/api/v1/tasks/{id}/status", id)
                        .contentType(APPLICATION_JSON)
                        .content("{\"status\": \"COMPLETED\"}"))
                .andExpect(status().isOk())
                .andExpect(content().json(completedJson, JsonCompareMode.LENIENT));

        mockMvc.perform(get("/api/v1/tasks/{id}", id))
                .andExpect(status().isOk())
                .andExpect(content().json(completedJson, JsonCompareMode.LENIENT));
    }

    @Test
    @SneakyThrows
    void changeTaskStatusSameStatusReturnsOk() {
        Long id = createTaskAndReturnId("Same status", "Desc");

        String expectedJson = """
                {
                    "id": %d,
                    "title": "Same status",
                    "description": "Desc",
                    "status": "NEW",
                    "due_date": null
                }
                """.formatted(id);
        mockMvc.perform(patch("/api/v1/tasks/{id}/status", id)
                        .contentType(APPLICATION_JSON)
                        .content("{\"status\": \"NEW\"}"))
                .andExpect(status().isOk())
                .andExpect(content().json(expectedJson, JsonCompareMode.LENIENT));
    }

    @Test
    @SneakyThrows
    void changeTaskStatusInvalidTransitionReturns400() {
        Long id = createTaskAndReturnId("Invalid transition", "Desc");

        String expectedJson = """
                {
                    "code": 400,
                    "message": "task.invalid_status_transition",
                    "humanMessage": "Invalid status transition from NEW to COMPLETED"
                }
                """;
        mockMvc.perform(patch("/api/v1/tasks/{id}/status", id)
                        .contentType(APPLICATION_JSON)
                        .content("{\"status\": \"COMPLETED\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().json(expectedJson, JsonCompareMode.LENIENT));
    }

    @Test
    @SneakyThrows
    void createTaskWithDueDateReturns200() {
        String expectedJson = """
                {
                    "title": "Task with due date",
                    "description": "Desc",
                    "status": "NEW",
                    "due_date": "2025-12-31T23:59:59Z"
                }
                """;
        mockMvc.perform(post("/api/v1/tasks")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                    "title": "Task with due date",
                                    "description": "Desc",
                                    "due_date": "2025-12-31T23:59:59Z"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(content().json(expectedJson, JsonCompareMode.LENIENT));
    }

    @Test
    @SneakyThrows
    void createTaskMissingTitleReturns400() {
        String expectedJson = """
                {
                    "code": 400,
                    "message": "validation.error"
                }
                """;
        mockMvc.perform(post("/api/v1/tasks")
                        .contentType(APPLICATION_JSON)
                        .content("{\"description\": \"Only description\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().json(expectedJson, JsonCompareMode.LENIENT));
    }

    @Test
    @SneakyThrows
    void createTaskEmptyTitleReturns400() {
        String expectedJson = """
                {
                    "code": 400,
                    "message": "validation.error"
                }
                """;
        mockMvc.perform(post("/api/v1/tasks")
                        .contentType(APPLICATION_JSON)
                        .content("{\"title\": \"\", \"description\": \"Desc\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().json(expectedJson, JsonCompareMode.LENIENT));
    }

    @Test
    @SneakyThrows
    void createTaskMissingDescriptionReturns400() {
        String expectedJson = """
                {
                    "code": 400,
                    "message": "validation.error"
                }
                """;
        mockMvc.perform(post("/api/v1/tasks")
                        .contentType(APPLICATION_JSON)
                        .content("{\"title\": \"Only title\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().json(expectedJson, JsonCompareMode.LENIENT));
    }

    @Test
    @SneakyThrows
    void listTasksWithDataReturnsPageWithTasks() {
        createTaskAndReturnId("One", "D1");
        createTaskAndReturnId("Two", "D2");

        String expectedJson = """
                {
                    "content": [
                        {"title": "One", "description": "D1", "status": "NEW"},
                        {"title": "Two", "description": "D2", "status": "NEW"}
                    ],
                    "totalElements": 2,
                    "totalPages": 1,
                    "size": 20,
                    "number": 0
                }
                """;
        mockMvc.perform(get("/api/v1/tasks").param("page", "0").param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(content().json(expectedJson, JsonCompareMode.LENIENT));
    }

    @Test
    @SneakyThrows
    void listTasksNegativePageReturns400() {
        mockMvc.perform(get("/api/v1/tasks").param("page", "-1").param("size", "20"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @SneakyThrows
    void listTasksSizeAboveMaxReturns400() {
        mockMvc.perform(get("/api/v1/tasks").param("page", "0").param("size", "101"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @SneakyThrows
    void updateTaskNotFoundReturns400() {
        String expectedJson = """
                {
                    "code": 400,
                    "message": "task.not_found",
                    "humanMessage": "Task not found: 99999"
                }
                """;
        mockMvc.perform(put("/api/v1/tasks/99999")
                        .contentType(APPLICATION_JSON)
                        .content("{\"title\": \"T\", \"description\": \"D\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().json(expectedJson, JsonCompareMode.LENIENT));
    }

    @Test
    @SneakyThrows
    void updateTaskWithDueDateReturns200() {
        Long id = createTaskAndReturnId("Task", "Desc");

        String expectedJson = """
                {
                    "id": %d,
                    "title": "Task",
                    "description": "Desc",
                    "status": "NEW",
                    "due_date": "2026-01-15T12:00:00Z"
                }
                """.formatted(id);
        mockMvc.perform(put("/api/v1/tasks/{id}", id)
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                    "title": "Task",
                                    "description": "Desc",
                                    "due_date": "2026-01-15T12:00:00Z"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(content().json(expectedJson, JsonCompareMode.LENIENT));
    }

    @Test
    @SneakyThrows
    void deleteTaskNotFoundReturns400() {
        String expectedJson = """
                {
                    "code": 400,
                    "message": "task.not_found",
                    "humanMessage": "Task not found: 88888"
                }
                """;
        mockMvc.perform(delete("/api/v1/tasks/88888"))
                .andExpect(status().isBadRequest())
                .andExpect(content().json(expectedJson, JsonCompareMode.LENIENT));
    }

    @Test
    @SneakyThrows
    void changeTaskStatusNotFoundReturns400() {
        String expectedJson = """
                {
                    "code": 400,
                    "message": "task.not_found",
                    "humanMessage": "Task not found: 77777"
                }
                """;
        mockMvc.perform(patch("/api/v1/tasks/77777/status")
                        .contentType(APPLICATION_JSON)
                        .content("{\"status\": \"IN_PROGRESS\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().json(expectedJson, JsonCompareMode.LENIENT));
    }

    @Test
    @SneakyThrows
    void changeTaskStatusBackwardTransitionReturns400() {
        Long id = createTaskAndReturnId("Backward", "Desc");
        mockMvc.perform(patch("/api/v1/tasks/{id}/status", id)
                        .contentType(APPLICATION_JSON)
                        .content("{\"status\": \"IN_PROGRESS\"}"))
                .andExpect(status().isOk());

        String expectedJson = """
                {
                    "code": 400,
                    "message": "task.invalid_status_transition",
                    "humanMessage": "Invalid status transition from IN_PROGRESS to NEW"
                }
                """;
        mockMvc.perform(patch("/api/v1/tasks/{id}/status", id)
                        .contentType(APPLICATION_JSON)
                        .content("{\"status\": \"NEW\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().json(expectedJson, JsonCompareMode.LENIENT));
    }

    @SneakyThrows
    private Long createTaskAndReturnId(String title, String description) {
        MvcResult result = mockMvc.perform(post("/api/v1/tasks")
                        .contentType(APPLICATION_JSON)
                        .content(String.format("""
                                {
                                    "title": "%s",
                                    "description": "%s"
                                }
                                """, title, description)))
                .andExpect(status().isOk())
                .andReturn();
        String json = result.getResponse().getContentAsString();
        JsonNode node = objectMapper.readTree(json);
        return node.get("id").asLong();
    }
}

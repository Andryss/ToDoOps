package ru.andart.todoops.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import ru.andart.todoops.entity.TaskEntity;
import ru.andart.todoops.generated.model.TaskStatus;
import ru.andart.todoops.repository.TaskRepository;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Creates default example tasks when the application runs with profile {@code functionTest}.
 * Runs after the application context is ready.
 */
@Component
@Profile("!functionTest")
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {
    private final TaskRepository taskRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (taskRepository.count() > 0) {
            return;
        }
        OffsetDateTime now = OffsetDateTime.now();
        List<TaskEntity> examples = new ArrayList<>();

        String[][] data = {
                {"Complete project documentation", "Write README and API docs for the ToDoOps backend.", "NEW", "7"},
                {"Review pull requests", "Check open PRs and provide feedback.", "IN_PROGRESS", "2"},
                {"Deploy to staging", "Run deployment pipeline and smoke tests.", "COMPLETED", "-1"},
                {"Setup CI/CD", "Configure GitHub Actions for build and test.", "NEW", null},
                {"Refactor auth module", "Extract JWT logic into a dedicated service.", "NEW", "14"},
                {"Add integration tests", "Cover main API endpoints with RestAssured.", "IN_PROGRESS", "5"},
                {"Update dependencies", "Bump Spring Boot and fix deprecations.", "COMPLETED", "-3"},
                {"Design database schema", "Create ER diagram and migration plan.", "NEW", "10"},
                {"Implement search API", "Full-text search for tasks by title and description.", "NEW", "21"},
                {"Fix memory leak in cache", "Profile and fix cache eviction.", "IN_PROGRESS", "1"},
                {"Write deployment runbook", "Step-by-step guide for production release.", "COMPLETED", "-7"},
                {"Add request logging", "Structured logs for all incoming requests.", "NEW", "3"},
                {"Optimize N+1 queries", "Add batch fetching for task lists.", "NEW", "5"},
                {"Setup monitoring", "Prometheus metrics and Grafana dashboards.", "IN_PROGRESS", "4"},
                {"Document error codes", "List all API error codes and meanings.", "COMPLETED", "-2"},
                {"Implement rate limiting", "Per-IP and per-user limits.", "NEW", "9"},
                {"Add health checks", "Liveness and readiness endpoints.", "NEW", "2"},
                {"Migrate to Java 21", "Update runtime and fix compatibility.", "IN_PROGRESS", "7"},
                {"Clean up dead code", "Remove unused classes and methods.", "COMPLETED", "-5"},
                {"Add OpenAPI examples", "Request/response examples in api.yaml.", "NEW", "6"},
                {"Implement soft delete", "Mark tasks as deleted instead of removing.", "NEW", "12"},
                {"Add task tags", "Many-to-many tags for filtering.", "IN_PROGRESS", "14"},
                {"Fix timezone handling", "Store and return UTC consistently.", "COMPLETED", "-1"},
                {"Add export to CSV", "Endpoint to export tasks as CSV.", "NEW", "8"},
                {"Setup local Docker Compose", "Postgres and app for local dev.", "NEW", "4"},
                {"Implement pagination metadata", "Total count and page info in list response.", "IN_PROGRESS", "2"},
                {"Add audit log", "Track who changed what and when.", "COMPLETED", "-4"},
                {"Create admin API", "Bulk operations and user management.", "NEW", "30"},
                {"Add task priorities", "High, medium, low with default.", "NEW", "11"},
                {"Optimize Docker image", "Multi-stage build and smaller layers.", "IN_PROGRESS", "3"},
                {"Document environment variables", "List all config options.", "COMPLETED", "-6"},
                {"Add WebSocket for live updates", "Notify clients when tasks change.", "NEW", "20"},
                {"Implement task templates", "Create task from predefined template.", "NEW", "15"},
                {"Add duplicate task action", "Copy task with new id.", "IN_PROGRESS", "5"},
                {"Fix validation messages", "User-friendly messages for all constraints.", "COMPLETED", "-2"},
                {"Add task comments", "Comments thread per task.", "NEW", "18"},
                {"Implement reminders", "Due date reminders via email or push.", "NEW", "25"},
                {"Add dark mode support", "Theme toggle in API or metadata.", "IN_PROGRESS", "10"},
                {"Migrate to R2DBC", "Reactive database access (spike).", "COMPLETED", "-14"},
                {"Add GraphQL endpoint", "Alternative API with GraphQL.", "NEW", "45"},
                {"Implement full-text search", "PostgreSQL full-text search.", "NEW", "12"},
                {"Add attachment upload", "Store files per task.", "IN_PROGRESS", "8"},
                {"Create mobile API version", "Simplified responses for mobile.", "COMPLETED", "-9"},
                {"Add OAuth2 login", "Google and GitHub login.", "NEW", "21"},
                {"Implement task recurrence", "Daily, weekly, monthly repeat.", "NEW", "28"},
                {"Add subtasks", "Parent-child task hierarchy.", "IN_PROGRESS", "14"},
                {"Fix CORS for production", "Restrict origins and headers.", "COMPLETED", "-3"},
                {"Add API versioning header", "X-API-Version and deprecation.", "NEW", "7"},
                {"Implement bulk status change", "Update many tasks at once.", "NEW", "5"},
                {"Add task sharing", "Share task with other users.", "IN_PROGRESS", "11"},
                {"Archive old completed tasks", "Move to archive after 90 days.", "COMPLETED", "-2"},
                {"Add keyboard shortcuts doc", "List shortcuts for frontend.", "NEW", "2"},
                {"Implement undo/redo", "History stack for task edits.", "NEW", "19"},
                {"Add task dependencies", "Blocked-by and blocks relations.", "IN_PROGRESS", "16"},
                {"Performance test under load", "Run 10k concurrent users test.", "COMPLETED", "-5"},
                {"Add Swagger UI theme", "Custom brand colors in Swagger.", "NEW", "4"},
                {"Implement task watchers", "Notify watchers on change.", "NEW", "13"},
                {"Add calendar view API", "Tasks grouped by date for calendar.", "IN_PROGRESS", "9"},
                {"Security audit", "OWASP checklist and fixes.", "COMPLETED", "-7"},
                {"Add OpenTelemetry tracing", "Distributed tracing for requests.", "NEW", "6"},
                {"Implement task time tracking", "Log hours spent on task.", "NEW", "22"},
        };

        for (String[] row : data) {
            String title = row[0];
            String description = row[1];
            TaskStatus status = TaskStatus.valueOf(row[2]);
            OffsetDateTime createdAt = now.minusDays((long) (Math.random() * 5));
            OffsetDateTime dueDate = null;
            if (row[3] != null) {
                long days = Long.parseLong(row[3]);
                dueDate = days >= 0 ? now.plusDays(days) : now.minusDays(-days);
            }
            examples.add(TaskEntity.builder()
                    .title(title)
                    .description(description)
                    .status(status)
                    .createdAt(createdAt)
                    .dueDate(dueDate)
                    .build());
        }

        taskRepository.saveAll(examples);
    }
}

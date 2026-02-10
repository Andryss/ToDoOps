package ru.andart.todoops.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.andart.todoops.entity.TaskEntity;

/**
 * Spring Data JPA repository for {@link TaskEntity}.
 */
@Repository
public interface TaskRepository extends JpaRepository<TaskEntity, Long> {
}

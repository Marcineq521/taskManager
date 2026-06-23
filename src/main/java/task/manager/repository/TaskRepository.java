package task.manager.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import task.manager.model.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {
}

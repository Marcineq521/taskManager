package task.manager.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import task.manager.model.Task;
import task.manager.user.User;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByOwner(User owner);

    List<Task> findByOwnerUsername(String username);
}

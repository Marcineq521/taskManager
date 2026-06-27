package task.manager.controller;

import org.springframework.web.bind.annotation.*;
import task.manager.dto.TaskResponse;
import task.manager.model.Task;
import task.manager.repository.TaskRepository;
import task.manager.user.User;
import task.manager.user.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public AdminController(UserRepository userRepository, TaskRepository taskRepository) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }

    @GetMapping("/users")
    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    @GetMapping("/tasks")
    public List<TaskResponse> getAllTasks(){
        return taskRepository.findAll()
                .stream()
                .map(task->new TaskResponse(
                        task.getId(),
                        task.getContent(),
                        task.isCompleted(),
                        task.getOwner().getUsername()
                ))
                .toList();

    }

    @DeleteMapping("/tasks/{id}")
    public void deleteTask(@PathVariable Long id){
        taskRepository.deleteById(id);
    }
}

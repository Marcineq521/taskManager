package task.manager.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import task.manager.model.Task;
import task.manager.repository.TaskRepository;
import task.manager.user.User;
import task.manager.user.UserRepository;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    public List<Task> getAllTasks(){
        User currentUser=getCurrentUser();
        return taskRepository.findByOwner(currentUser);
    }

    public Task addTask(Task task){
        User currentUser=getCurrentUser();
        task.setOwner(currentUser);
        return taskRepository.save(task);
    }
    public void deleteTask( Long id){
        User currentUser=getCurrentUser();
        Task task=taskRepository.findById(id).orElseThrow(()->new RuntimeException("Task not found"));

        if(!task.getOwner().getId().equals(currentUser.getId())){
            throw new RuntimeException("No access to this task");
        }
        taskRepository.delete(task);
    }
    public Task updateTask(Long id,Task updatedTask){
        User currentUser=getCurrentUser();

        Task task=taskRepository.findById(id).orElseThrow(()->new RuntimeException("Task not found"));

        if(!task.getOwner().getId().equals(currentUser.getId())){
            throw new RuntimeException("No access to this task");
        }
        task.setContent(updatedTask.getContent());
        task.setCompleted(updatedTask.isCompleted());

        return taskRepository.save(task);

    }

    private User getCurrentUser(){
        Authentication authentication= SecurityContextHolder.getContext().getAuthentication();

        String username= authentication.getName();

        return userRepository.findByUsername(username).orElseThrow(()->new RuntimeException("User not found"));
    }

}



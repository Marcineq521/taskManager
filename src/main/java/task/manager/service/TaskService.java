package task.manager.service;

import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;
import task.manager.model.Task;
import task.manager.repository.TaskRepository;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<Task> getAllTasks(){
        return taskRepository.findAll();
    }

    public Task addTask(Task task){
        return taskRepository.save(task);
    }
    public void deleteTask( Long id){
        taskRepository.deleteById(id);
    }
    public Task updateTask(Long id,Task updatedTask){
        Task task=taskRepository.findById(id).orElseThrow(()->new RuntimeException("Task not found"));
        task.setContent(updatedTask.getContent());
        task.setCompleted(updatedTask.isCompleted());

        return taskRepository.save(task);
    }
}



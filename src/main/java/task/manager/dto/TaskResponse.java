package task.manager.dto;

public record TaskResponse (
    Long id,
    String content,
    boolean completed,
    String ownerUsername

) {
}

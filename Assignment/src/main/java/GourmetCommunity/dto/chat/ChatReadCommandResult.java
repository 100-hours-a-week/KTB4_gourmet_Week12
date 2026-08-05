package GourmetCommunity.dto.chat;

public record ChatReadCommandResult(
        ChatReadEventDto event,
        Long userAId,
        Long userBId,
        boolean changed
) {
}
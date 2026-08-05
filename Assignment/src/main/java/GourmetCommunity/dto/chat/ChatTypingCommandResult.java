package GourmetCommunity.dto.chat;

public record ChatTypingCommandResult(
        ChatTypingEventDto event,
        Long receiverId
) {
}
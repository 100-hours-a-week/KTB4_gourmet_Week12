package GourmetCommunity.dto.chat;

public record ChatTypingEventDto(
        Long roomId,
        Long userId,
        boolean typing
) {
}
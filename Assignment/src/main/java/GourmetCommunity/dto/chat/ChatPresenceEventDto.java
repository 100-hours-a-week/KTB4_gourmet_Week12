package GourmetCommunity.dto.chat;

public record ChatPresenceEventDto(
        Long userId,
        boolean online
) {
}
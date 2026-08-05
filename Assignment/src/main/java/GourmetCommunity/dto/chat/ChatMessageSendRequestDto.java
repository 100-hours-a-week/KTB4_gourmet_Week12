package GourmetCommunity.dto.chat;

public record ChatMessageSendRequestDto(
        String clientMessageId,
        String content
) {
}
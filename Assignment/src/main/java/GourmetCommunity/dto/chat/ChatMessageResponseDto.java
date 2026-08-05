package GourmetCommunity.dto.chat;

import GourmetCommunity.entity.ChatMessage;
import GourmetCommunity.entity.User;

import java.time.LocalDateTime;

public record ChatMessageResponseDto(
        Long messageId,
        Long roomId,
        Long sequence,
        Long senderId,
        String senderNickname,
        String clientMessageId,
        String content,
        LocalDateTime createdAt
) {

    public static ChatMessageResponseDto from(
            ChatMessage message
    ) {
        User sender =
                message.getSender();

        String senderNickname =
                sender.getDeletedAt() != null
                        ? "알 수 없음"
                        : sender.getNickname();

        return new ChatMessageResponseDto(
                message.getId(),
                message.getRoom().getId(),
                message.getSequence(),
                sender.getId(),
                senderNickname,
                message.getClientMessageId(),
                message.getContent(),
                message.getCreatedAt()
        );
    }
}
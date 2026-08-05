package GourmetCommunity.dto.chat;

import GourmetCommunity.entity.ChatMessage;
import GourmetCommunity.entity.ChatRoom;
import GourmetCommunity.entity.User;

import java.time.LocalDateTime;

public record ChatRoomSummaryResponseDto(
        Long roomId,

        Long friendUserId,
        String friendNickname,
        String friendProfileImage,

        Long latestMessageId,
        Long latestMessageSequence,
        Long latestMessageSenderId,
        String latestMessageContent,
        LocalDateTime latestMessageCreatedAt,

        long unreadCount,

        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static ChatRoomSummaryResponseDto from(
            ChatRoom chatRoom,
            Long loginUserId,
            ChatMessage latestMessage,
            long unreadCount
    ) {
        User friend =
                chatRoom.getOtherUser(
                        loginUserId
                );

        boolean friendDeleted =
                friend.getDeletedAt() != null;

        return new ChatRoomSummaryResponseDto(
                chatRoom.getId(),

                friend.getId(),

                friendDeleted
                        ? "알 수 없음"
                        : friend.getNickname(),

                friendDeleted
                        ? null
                        : friend.getProfileImage(),

                latestMessage == null
                        ? null
                        : latestMessage.getId(),

                latestMessage == null
                        ? null
                        : latestMessage.getSequence(),

                latestMessage == null
                        ? null
                        : latestMessage
                        .getSender()
                        .getId(),

                latestMessage == null
                        ? null
                        : latestMessage.getContent(),

                latestMessage == null
                        ? null
                        : latestMessage.getCreatedAt(),

                Math.max(
                        unreadCount,
                        0
                ),

                chatRoom.getCreatedAt(),
                chatRoom.getUpdatedAt()
        );
    }
}
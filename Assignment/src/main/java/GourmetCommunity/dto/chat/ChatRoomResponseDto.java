package GourmetCommunity.dto.chat;

import GourmetCommunity.entity.ChatRoom;
import GourmetCommunity.entity.User;

import java.time.LocalDateTime;

public record ChatRoomResponseDto(
        Long roomId,
        Long friendUserId,
        String friendNickname,
        String friendProfileImage,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static ChatRoomResponseDto from(
            ChatRoom chatRoom,
            Long loginUserId
    ) {
        User friend =
                chatRoom.getOtherUser(
                        loginUserId
                );

        return new ChatRoomResponseDto(
                chatRoom.getId(),
                friend.getId(),
                friend.getDeletedAt() != null
                        ? "알 수 없음"
                        : friend.getNickname(),
                friend.getDeletedAt() != null
                        ? null
                        : friend.getProfileImage(),
                chatRoom.getCreatedAt(),
                chatRoom.getUpdatedAt()
        );
    }
}
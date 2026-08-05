package GourmetCommunity.dto.chat;

public record ChatReadStateResponseDto(
        Long roomId,

        Long currentUserId,
        Long currentUserLastReadSequence,

        Long otherUserId,
        Long otherUserLastReadSequence
) {
}
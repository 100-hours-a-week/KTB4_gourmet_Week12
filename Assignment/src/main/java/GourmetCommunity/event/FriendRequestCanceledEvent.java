package GourmetCommunity.event;

public record FriendRequestCanceledEvent(
        Long requestId,
        Long senderId,
        Long receiverId
) {
}
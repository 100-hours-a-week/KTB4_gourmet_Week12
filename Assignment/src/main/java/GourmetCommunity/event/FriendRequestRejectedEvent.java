package GourmetCommunity.event;

public record FriendRequestRejectedEvent(
        Long requestId,
        Long senderId,
        Long receiverId
) {
}
package GourmetCommunity.event;

public record FriendRequestCreatedEvent(
        Long requestId,
        Long senderId,
        Long receiverId
) {
}
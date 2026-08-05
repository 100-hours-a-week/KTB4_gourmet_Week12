package GourmetCommunity.event;

public record FriendRequestAcceptedEvent(
        Long requestId,
        Long friendshipId,
        Long senderId,
        Long receiverId
) {
}
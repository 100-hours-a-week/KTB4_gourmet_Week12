package GourmetCommunity.event;

public record NotificationRemovedEvent(
        Long receiverId,
        Long notificationId
) {
}
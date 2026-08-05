package GourmetCommunity.event;

import GourmetCommunity.dto.NotificationResponseDto;

public record NotificationCreatedEvent(
        Long receiverId,
        NotificationResponseDto notification
) {
}
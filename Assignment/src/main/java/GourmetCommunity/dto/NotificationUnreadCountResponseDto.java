package GourmetCommunity.dto;

import lombok.Getter;

@Getter
public class NotificationUnreadCountResponseDto {

    private final long unreadCount;

    public NotificationUnreadCountResponseDto(
            long unreadCount
    ) {
        this.unreadCount = unreadCount;
    }
}
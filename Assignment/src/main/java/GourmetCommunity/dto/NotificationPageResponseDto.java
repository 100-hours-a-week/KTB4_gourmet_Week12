package GourmetCommunity.dto;

import GourmetCommunity.entity.Notification;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
public class NotificationPageResponseDto {

    private final List<NotificationResponseDto> notifications;

    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;

    private final boolean first;
    private final boolean last;

    public NotificationPageResponseDto(
            Page<Notification> notificationPage
    ) {
        this.notifications = notificationPage
                .getContent()
                .stream()
                .map(NotificationResponseDto::new)
                .toList();

        this.page = notificationPage.getNumber();
        this.size = notificationPage.getSize();
        this.totalElements =
                notificationPage.getTotalElements();
        this.totalPages =
                notificationPage.getTotalPages();

        this.first = notificationPage.isFirst();
        this.last = notificationPage.isLast();
    }
}
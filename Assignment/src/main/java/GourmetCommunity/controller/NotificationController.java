package GourmetCommunity.controller;

import GourmetCommunity.auth.SecurityUtil;
import GourmetCommunity.dto.NotificationPageResponseDto;
import GourmetCommunity.dto.NotificationUnreadCountResponseDto;
import GourmetCommunity.service.NotificationService;
import GourmetCommunity.service.NotificationSseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService
            notificationService;

    private final NotificationSseService
            notificationSseService;

    @GetMapping
    public ResponseEntity<NotificationPageResponseDto>
    getNotifications(
            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {
        NotificationPageResponseDto response =
                notificationService.getNotifications(
                        PageRequest.of(page, size)
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<
            NotificationUnreadCountResponseDto
            > getUnreadCount() {
        return ResponseEntity.ok(
                notificationService.getUnreadCount()
        );
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long notificationId
    ) {
        notificationService.markAsRead(
                notificationId
        );

        return ResponseEntity
                .noContent()
                .build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsRead();

        return ResponseEntity
                .noContent()
                .build();
    }

    @GetMapping(
            path = "/subscribe",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE
    )
    public SseEmitter subscribe() {
        Long loginUserId =
                SecurityUtil.getLoginUserId();

        return notificationSseService.subscribe(
                loginUserId
        );
    }
}
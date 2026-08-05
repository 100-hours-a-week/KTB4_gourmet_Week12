package GourmetCommunity.service;

import GourmetCommunity.auth.SecurityUtil;
import GourmetCommunity.dto.NotificationPageResponseDto;
import GourmetCommunity.dto.NotificationResponseDto;
import GourmetCommunity.dto.NotificationUnreadCountResponseDto;
import GourmetCommunity.entity.Comment;
import GourmetCommunity.entity.Notification;
import GourmetCommunity.entity.NotificationType;
import GourmetCommunity.entity.Post;
import GourmetCommunity.entity.User;
import GourmetCommunity.event.NotificationCreatedEvent;
import GourmetCommunity.event.NotificationRemovedEvent;
import GourmetCommunity.exception.NotificationNotFoundException;
import GourmetCommunity.repository.NotificationRepository;
import GourmetCommunity.event.NotificationReadAllEvent;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository
            notificationRepository;

    private final NotificationCommandService
            notificationCommandService;

    private final ApplicationEventPublisher
            eventPublisher;

    public NotificationPageResponseDto getNotifications(
            Pageable pageable
    ) {
        Long receiverId =
                SecurityUtil.getLoginUserId();

        return new NotificationPageResponseDto(
                notificationRepository
                        .findByReceiver_IdOrderByIdDesc(
                                receiverId,
                                pageable
                        )
        );
    }

    public NotificationUnreadCountResponseDto
    getUnreadCount() {
        Long receiverId =
                SecurityUtil.getLoginUserId();

        long unreadCount =
                notificationRepository
                        .countByReceiver_IdAndReadFalse(
                                receiverId
                        );

        return new NotificationUnreadCountResponseDto(
                unreadCount
        );
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Long receiverId =
                SecurityUtil.getLoginUserId();

        Notification notification =
                notificationRepository
                        .findByIdAndReceiver_Id(
                                notificationId,
                                receiverId
                        )
                        .orElseThrow(() ->
                                new NotificationNotFoundException(
                                        "알림을 찾을 수 없습니다."
                                )
                        );

        notification.markAsRead();
    }

    @Transactional
    public void createCommentNotification(
            Post post,
            User sender,
            Comment comment
    ) {
        User receiver =
                post.getUser();

        if (
                receiver.getId()
                        .equals(sender.getId())
        ) {
            return;
        }

        Notification notification =
                Notification.commentCreated(
                        receiver,
                        sender,
                        post.getId(),
                        comment.getId()
                );

        notificationCommandService
                .saveAndPublish(notification);
    }

    @Transactional
    public void createLikeNotification(
            Post post,
            User sender
    ) {
        User receiver =
                post.getUser();

        if (
                receiver.getId()
                        .equals(sender.getId())
        ) {
            return;
        }

        Notification notification =
                Notification.postLiked(
                        receiver,
                        sender,
                        post.getId()
                );

        notificationCommandService
                .saveAndPublish(notification);
    }

    @Transactional
    public void deleteLikeNotification(
            Long senderId,
            Long postId
    ) {
        List<Notification> notifications =
                notificationRepository
                        .findAllByTypeAndSender_IdAndPostId(
                                NotificationType.POST_LIKED,
                                senderId,
                                postId
                        );

        notificationCommandService
                .deleteAndPublish(
                        notifications
                );
    }

    @Transactional
    public void deleteCommentNotification(
            Long commentId
    ) {
        List<Notification> notifications =
                notificationRepository
                        .findAllByCommentId(commentId);

        notificationCommandService
                .deleteAndPublish(
                        notifications
                );
    }

    @Transactional
    public void markAllAsRead() {
        Long receiverId =
                SecurityUtil.getLoginUserId();

        notificationRepository
                .markAllAsReadByReceiverId(
                        receiverId
                );

        eventPublisher.publishEvent(
                new NotificationReadAllEvent(
                        receiverId
                )
        );
    }


}
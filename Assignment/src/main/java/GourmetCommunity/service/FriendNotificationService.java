package GourmetCommunity.service;

import GourmetCommunity.entity.Notification;
import GourmetCommunity.entity.NotificationType;
import GourmetCommunity.entity.User;
import GourmetCommunity.repository.NotificationRepository;
import GourmetCommunity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FriendNotificationService {

    private final UserRepository
            userRepository;

    private final NotificationRepository
            notificationRepository;

    private final NotificationCommandService
            notificationCommandService;

    /*
     * 친구 요청 트랜잭션이 Commit된 이후
     * 독립된 새 트랜잭션으로 알림을 저장한다.
     */
    @Transactional(
            propagation = Propagation.REQUIRES_NEW
    )
    public void notifyRequestCreated(
            Long friendRequestId,
            Long senderId,
            Long receiverId
    ) {
        Optional<User> senderOptional =
                findActiveUser(senderId);

        Optional<User> receiverOptional =
                findActiveUser(receiverId);

        if (
                senderOptional.isEmpty()
                        || receiverOptional.isEmpty()
        ) {
            return;
        }

        Notification notification =
                Notification.friendRequested(
                        receiverOptional.get(),
                        senderOptional.get(),
                        friendRequestId
                );

        notificationCommandService
                .saveAndPublish(notification);
    }

    @Transactional(
            propagation = Propagation.REQUIRES_NEW
    )
    public void notifyRequestAccepted(
            Long friendRequestId,
            Long originalSenderId,
            Long acceptingUserId
    ) {
        removeRequestNotification(
                friendRequestId
        );

        Optional<User> originalSender =
                findActiveUser(
                        originalSenderId
                );

        Optional<User> acceptingUser =
                findActiveUser(
                        acceptingUserId
                );

        if (
                originalSender.isEmpty()
                        || acceptingUser.isEmpty()
        ) {
            return;
        }

        Notification notification =
                Notification.friendAccepted(
                        originalSender.get(),
                        acceptingUser.get(),
                        friendRequestId
                );

        notificationCommandService
                .saveAndPublish(notification);
    }

    @Transactional(
            propagation = Propagation.REQUIRES_NEW
    )
    public void removePendingRequestNotification(
            Long friendRequestId
    ) {
        removeRequestNotification(
                friendRequestId
        );
    }

    private void removeRequestNotification(
            Long friendRequestId
    ) {
        List<Notification> notifications =
                notificationRepository
                        .findAllByFriendRequestIdAndType(
                                friendRequestId,
                                NotificationType
                                        .FRIEND_REQUESTED
                        );

        notificationCommandService
                .deleteAndPublish(
                        notifications
                );
    }

    private Optional<User> findActiveUser(
            Long userId
    ) {
        return userRepository
                .findById(userId)
                .filter(user ->
                        user.getDeletedAt() == null
                );
    }
}
package GourmetCommunity.repository;

import GourmetCommunity.entity.Notification;
import GourmetCommunity.entity.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

import java.util.Optional;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification>
    findAllByTypeAndSender_IdAndPostId(
            NotificationType type,
            Long senderId,
            Long postId
    );

    List<Notification>
    findAllByCommentId(Long commentId);

    List<Notification>
    findAllByFriendRequestIdAndType(
            Long friendRequestId,
            NotificationType type
    );

    @Modifying(
            clearAutomatically = true,
            flushAutomatically = true
    )
    @Query("""
        UPDATE Notification notification
        SET notification.read = true
        WHERE notification.receiver.id = :receiverId
          AND notification.read = false
        """)
    int markAllAsReadByReceiverId(
            @Param("receiverId") Long receiverId
    );

    @EntityGraph(attributePaths = "sender")
    Page<Notification> findByReceiver_IdOrderByIdDesc(
            Long receiverId,
            Pageable pageable
    );

    long countByReceiver_IdAndReadFalse(Long receiverId);

    Optional<Notification> findByIdAndReceiver_Id(
            Long notificationId,
            Long receiverId
    );

    void deleteByPostId(Long postId);
}
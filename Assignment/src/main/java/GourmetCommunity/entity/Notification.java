package GourmetCommunity.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "notifications",
        indexes = {
                @Index(
                        name = "idx_notifications_receiver_read_created",
                        columnList =
                                "receiver_id, is_read, created_at, notification_id"
                ),
                @Index(
                        name = "idx_notifications_post",
                        columnList = "post_id"
                ),
                @Index(
                        name = "idx_notifications_comment",
                        columnList = "comment_id"
                ),
                @Index(
                        name = "idx_notifications_friend_request",
                        columnList = "friend_request_id"
                )
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notification {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    @Column(name = "notification_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "receiver_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_notifications_receiver"
            )
    )
    private User receiver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "sender_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_notifications_sender"
            )
    )
    private User sender;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "notification_type",
            nullable = false,
            length = 30
    )
    private NotificationType type;

    /*
     * 게시글 관련 알림에서만 사용한다.
     */
    @Column(name = "post_id")
    private Long postId;

    /*
     * 댓글 알림에서만 사용한다.
     */
    @Column(name = "comment_id")
    private Long commentId;

    /*
     * 친구 요청 관련 알림에서만 사용한다.
     *
     * FriendRequest 연관관계로 연결하지 않고
     * ID 값만 저장한다.
     *
     * 요청 행의 삭제나 상태 변경이 알림 FK에
     * 영향을 받지 않도록 하기 위함이다.
     */
    @Column(name = "friend_request_id")
    private Long friendRequestId;

    @Column(
            name = "is_read",
            nullable = false
    )
    private boolean read;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    private Notification(
            User receiver,
            User sender,
            NotificationType type,
            Long postId,
            Long commentId,
            Long friendRequestId
    ) {
        validateUsers(
                receiver,
                sender
        );

        this.receiver = receiver;
        this.sender = sender;
        this.type = type;

        this.postId = postId;
        this.commentId = commentId;
        this.friendRequestId =
                friendRequestId;

        this.read = false;

        validateTarget();
    }

    public static Notification commentCreated(
            User receiver,
            User sender,
            Long postId,
            Long commentId
    ) {
        return new Notification(
                receiver,
                sender,
                NotificationType.COMMENT_CREATED,
                postId,
                commentId,
                null
        );
    }

    public static Notification postLiked(
            User receiver,
            User sender,
            Long postId
    ) {
        return new Notification(
                receiver,
                sender,
                NotificationType.POST_LIKED,
                postId,
                null,
                null
        );
    }

    public static Notification friendRequested(
            User receiver,
            User sender,
            Long friendRequestId
    ) {
        return new Notification(
                receiver,
                sender,
                NotificationType.FRIEND_REQUESTED,
                null,
                null,
                friendRequestId
        );
    }

    public static Notification friendAccepted(
            User receiver,
            User sender,
            Long friendRequestId
    ) {
        return new Notification(
                receiver,
                sender,
                NotificationType.FRIEND_ACCEPTED,
                null,
                null,
                friendRequestId
        );
    }

    public Long getReceiverId() {
        return receiver.getId();
    }

    public Long getSenderId() {
        return sender.getId();
    }

    public void markAsRead() {
        this.read = true;
    }

    private void validateUsers(
            User receiver,
            User sender
    ) {
        if (
                receiver == null
                        || sender == null
        ) {
            throw new IllegalArgumentException(
                    "알림 수신자와 발신자가 필요합니다."
            );
        }

        if (
                receiver.getId() == null
                        || sender.getId() == null
        ) {
            throw new IllegalArgumentException(
                    "저장된 사용자만 알림에 사용할 수 있습니다."
            );
        }

        if (
                receiver.getId()
                        .equals(sender.getId())
        ) {
            throw new IllegalArgumentException(
                    "자기 자신에게 알림을 생성할 수 없습니다."
            );
        }
    }

    private void validateTarget() {
        switch (type) {
            case COMMENT_CREATED -> {
                if (
                        postId == null
                                || commentId == null
                                || friendRequestId != null
                ) {
                    throw new IllegalArgumentException(
                            "댓글 알림 대상 정보가 올바르지 않습니다."
                    );
                }
            }

            case POST_LIKED -> {
                if (
                        postId == null
                                || commentId != null
                                || friendRequestId != null
                ) {
                    throw new IllegalArgumentException(
                            "좋아요 알림 대상 정보가 올바르지 않습니다."
                    );
                }
            }

            case FRIEND_REQUESTED,
                 FRIEND_ACCEPTED -> {
                if (
                        postId != null
                                || commentId != null
                                || friendRequestId == null
                ) {
                    throw new IllegalArgumentException(
                            "친구 요청 알림 대상 정보가 올바르지 않습니다."
                    );
                }
            }
        }
    }

    @PrePersist
    private void prePersist() {
        validateTarget();

        this.createdAt =
                LocalDateTime.now();
    }
}
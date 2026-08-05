package GourmetCommunity.dto;

import GourmetCommunity.entity.Notification;
import GourmetCommunity.entity.NotificationType;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class NotificationResponseDto {

    private final Long id;
    private final NotificationType type;

    private final Long senderId;
    private final String senderNickname;
    private final String senderProfileImage;

    private final Long postId;
    private final Long commentId;
    private final Long friendRequestId;

    private final boolean read;
    private final LocalDateTime createdAt;
    private final String message;

    public NotificationResponseDto(
            Notification notification
    ) {
        this.id =
                notification.getId();

        this.type =
                notification.getType();

        this.senderId =
                notification.getSenderId();

        this.senderNickname =
                notification.getSender()
                        .getDeletedAt() == null
                        ? notification
                        .getSender()
                        .getNickname()
                        : "탈퇴한 회원";

        this.senderProfileImage =
                notification.getSender()
                        .getDeletedAt() == null
                        ? notification
                        .getSender()
                        .getProfileImage()
                        : null;

        this.postId =
                notification.getPostId();

        this.commentId =
                notification.getCommentId();

        this.friendRequestId =
                notification
                        .getFriendRequestId();

        this.read =
                notification.isRead();

        this.createdAt =
                notification.getCreatedAt();

        this.message =
                createMessage(
                        notification.getType(),
                        senderNickname
                );
    }

    private String createMessage(
            NotificationType type,
            String senderNickname
    ) {
        return switch (type) {
            case COMMENT_CREATED ->
                    senderNickname
                            + "님이 회원님의 게시글에 댓글을 작성했습니다.";

            case POST_LIKED ->
                    senderNickname
                            + "님이 회원님의 게시글을 좋아합니다.";

            case FRIEND_REQUESTED ->
                    senderNickname
                            + "님이 친구 요청을 보냈습니다.";

            case FRIEND_ACCEPTED ->
                    senderNickname
                            + "님이 친구 요청을 수락했습니다.";
        };
    }
}
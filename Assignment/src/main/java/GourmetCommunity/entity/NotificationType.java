package GourmetCommunity.entity;

public enum NotificationType {

    COMMENT_CREATED,
    POST_LIKED,

    FRIEND_REQUESTED,
    FRIEND_ACCEPTED
    // 댓글 작성/좋아요 등록에 관련 알림
    // 댓글 수정/삭제, 좋아요 취소는 새로운 알림 종류로 안 만든다.
}

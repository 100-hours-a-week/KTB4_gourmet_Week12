package GourmetCommunity.dto;

import GourmetCommunity.entity.Comment;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class CommentResponseDto {

    private final Long id;
    private final Long postId;
    private final Long userId;
    private final String nickname;
    private final String profileImage;
    private final String content;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public CommentResponseDto(Comment comment) {
        this.id = comment.getId();
        this.postId = comment.getPostId();
        this.userId = comment.getUserId();
        this.nickname = comment.getUser().getDeletedAt() == null
                ? comment.getUser().getNickname()
                : "알 수 없음";
        this.profileImage = comment.getUser().getDeletedAt() == null
                ? comment.getUser().getProfileImage()
                : null;
        this.content = comment.getContent();
        this.createdAt = comment.getCreatedAt();
        this.updatedAt = comment.getUpdatedAt();
    }
}
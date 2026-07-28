package GourmetCommunity.dto;

import GourmetCommunity.entity.BoardType;
import GourmetCommunity.entity.Post;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
public class PostResponseDto {

    private final Long id;
    private final Long userId;
    private final String nickname;
    private final String profileImage;
    private final String title;
    private final String content;
    private final BoardType boardType;
    private final int viewCount;
    private final long likeCount;
    private final long commentCount;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
    private final List<String> imageUrls;

    public PostResponseDto(Post post) {
        this(post, 0, 0, List.of());
    }

    public PostResponseDto(
            Post post,
            long likeCount,
            long commentCount
    ) {
        this(post, likeCount, commentCount, List.of());
    }

    public PostResponseDto(
            Post post,
            long likeCount,
            long commentCount,
            List<String> imageUrls
    ) {
        this.id = post.getId();
        this.userId = post.getUserId();

        this.nickname = post.getUser().getDeletedAt() == null
                ? post.getUser().getNickname()
                : "알 수 없음";

        this.profileImage = post.getUser().getDeletedAt() == null
                ? post.getUser().getProfileImage()
                : null;

        this.title = post.getTitle();
        this.content = post.getContent();
        this.boardType = post.getBoardType();
        this.viewCount = post.getViewCount();
        this.likeCount = likeCount;
        this.commentCount = commentCount;
        this.imageUrls = imageUrls;
        this.createdAt = post.getCreatedAt();
        this.updatedAt = post.getUpdatedAt();
    }
}
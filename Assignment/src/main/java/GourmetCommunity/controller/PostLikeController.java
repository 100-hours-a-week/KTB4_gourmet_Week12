package GourmetCommunity.controller;

import GourmetCommunity.dto.PostLikeResponseDto;
import GourmetCommunity.service.PostLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class PostLikeController {

    private final PostLikeService postLikeService;

    /**
     * 로그인 사용자의 좋아요 상태 조회
     */
    @GetMapping("/posts/{postId}/likes")
    public PostLikeResponseDto getLikeStatus(
            @PathVariable Long postId
    ) {
        return postLikeService
                .getLikeStatus(postId);
    }

    /**
     * 게시글을 좋아요 상태로 만든다.
     */
    @PostMapping("/posts/{postId}/likes")
    public PostLikeResponseDto addLike(
            @PathVariable Long postId
    ) {
        return postLikeService
                .addLike(postId);
    }

    /**
     * 게시글을 좋아요하지 않은 상태로 만든다.
     */
    @DeleteMapping("/posts/{postId}/likes")
    public PostLikeResponseDto removeLike(
            @PathVariable Long postId
    ) {
        return postLikeService
                .removeLike(postId);
    }
}
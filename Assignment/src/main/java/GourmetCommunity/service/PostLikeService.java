package GourmetCommunity.service;

import GourmetCommunity.auth.SecurityUtil;
import GourmetCommunity.dto.PostLikeResponseDto;
import GourmetCommunity.entity.Post;
import GourmetCommunity.entity.PostLike;
import GourmetCommunity.entity.User;
import GourmetCommunity.exception.PostNotFoundException;
import GourmetCommunity.exception.UserNotFoundException;
import GourmetCommunity.repository.PostLikeRepository;
import GourmetCommunity.repository.PostRepository;
import GourmetCommunity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostLikeService {

    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /**
     * 로그인 사용자의 현재 좋아요 상태와
     * 게시글의 전체 좋아요 수를 반환한다.
     */
    public PostLikeResponseDto getLikeStatus(
            Long postId
    ) {
        Long userId =
                SecurityUtil.getLoginUserId();

        validatePostExists(postId);

        boolean liked =
                postLikeRepository
                        .existsByUser_IdAndPost_Id(
                                userId,
                                postId
                        );

        long likeCount =
                postLikeRepository
                        .countByPost_Id(postId);

        return new PostLikeResponseDto(
                liked,
                likeCount
        );
    }

    /**
     * 게시글을 좋아요 상태로 만든다.
     *
     * 이미 좋아요 상태라면 새 행과 새 알림을 만들지 않고
     * 현재 상태를 그대로 반환한다.
     */
    @Transactional
    public PostLikeResponseDto addLike(
            Long postId
    ) {
        Long userId =
                SecurityUtil.getLoginUserId();

        /*
         * 같은 사용자가 여러 탭에서 동시에 좋아요 요청을
         * 보내더라도 순차적으로 처리되도록 사용자 행을 잠근다.
         */
        User user =
                userRepository
                        .findByIdForUpdate(userId)
                        .orElseThrow(() ->
                                new UserNotFoundException(
                                        "회원을 찾을 수 없습니다."
                                )
                        );

        Post post =
                postRepository
                        .findById(postId)
                        .orElseThrow(() ->
                                new PostNotFoundException(
                                        "게시글을 찾을 수 없습니다."
                                )
                        );

        boolean alreadyLiked =
                postLikeRepository
                        .existsByUser_IdAndPost_Id(
                                userId,
                                postId
                        );

        /*
         * POST 요청을 여러 번 보내도 결과는 항상 좋아요 상태다.
         * 중복 PostLike와 중복 알림을 만들지 않는다.
         */
        if (alreadyLiked) {
            return createResponse(
                    true,
                    postId
            );
        }

        PostLike postLike =
                new PostLike(
                        user,
                        post
                );

        /*
         * DB UNIQUE(user_id, post_id) 제약이
         * 최종 중복 방어선 역할을 한다.
         */
        postLikeRepository
                .saveAndFlush(postLike);

        notificationService
                .createLikeNotification(
                        post,
                        user
                );

        return createResponse(
                true,
                postId
        );
    }

    /**
     * 게시글을 좋아요하지 않은 상태로 만든다.
     *
     * 이미 좋아요하지 않은 상태라면 오류 없이
     * 현재 상태를 그대로 반환한다.
     */
    @Transactional
    public PostLikeResponseDto removeLike(
            Long postId
    ) {
        Long userId =
                SecurityUtil.getLoginUserId();

        /*
         * 등록과 취소가 동시에 요청됐을 때도
         * 같은 사용자 요청은 한 번에 하나씩 처리한다.
         */
        userRepository
                .findByIdForUpdate(userId)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "회원을 찾을 수 없습니다."
                        )
                );

        validatePostExists(postId);

        PostLike postLike =
                postLikeRepository
                        .findByUser_IdAndPost_Id(
                                userId,
                                postId
                        )
                        .orElse(null);

        /*
         * DELETE 요청을 여러 번 보내도 결과는 항상
         * 좋아요하지 않은 상태다.
         */
        if (postLike == null) {
            return createResponse(
                    false,
                    postId
            );
        }

        postLikeRepository.delete(postLike);
        postLikeRepository.flush();

        notificationService
                .deleteLikeNotification(
                        userId,
                        postId
                );

        return createResponse(
                false,
                postId
        );
    }

    private PostLikeResponseDto createResponse(
            boolean liked,
            Long postId
    ) {
        long likeCount =
                postLikeRepository
                        .countByPost_Id(postId);

        return new PostLikeResponseDto(
                liked,
                likeCount
        );
    }

    private void validatePostExists(
            Long postId
    ) {
        if (!postRepository.existsById(postId)) {
            throw new PostNotFoundException(
                    "게시글을 찾을 수 없습니다."
            );
        }
    }
}
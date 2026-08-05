package GourmetCommunity.service;

import GourmetCommunity.dto.PostCreateRequestDto;
import GourmetCommunity.dto.PostPageResponseDto;
import GourmetCommunity.dto.PostResponseDto;
import GourmetCommunity.dto.PostUpdateRequestDto;
import GourmetCommunity.entity.Post;
import GourmetCommunity.entity.PostImage;
import GourmetCommunity.entity.PostView;
import GourmetCommunity.entity.User;
import GourmetCommunity.exception.PostNotFoundException;
import GourmetCommunity.exception.UserNotFoundException;
import GourmetCommunity.repository.CommentRepository;
import GourmetCommunity.repository.PostImageRepository;
import GourmetCommunity.repository.PostLikeRepository;
import GourmetCommunity.repository.PostRepository;
import GourmetCommunity.repository.PostViewRepository;
import GourmetCommunity.repository.UserRepository;
import GourmetCommunity.auth.SecurityUtil;
import GourmetCommunity.entity.BoardType;
import GourmetCommunity.service.assembler.PostResponseAssembler;
import GourmetCommunity.dto.PopularPostResponseDto;
import GourmetCommunity.repository.projection.PopularPostRankingProjection;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import jakarta.persistence.EntityManager;

import org.springframework.data.domain.Pageable;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostImageRepository postImageRepository;
    private final PostViewRepository postViewRepository;
    private final FileStorageService fileStorageService;
    private final PostResponseAssembler postResponseAssembler;
    private final EntityManager entityManager;

    @Transactional
    public PostResponseDto createPost(
            Long userId,
            PostCreateRequestDto request,
            List<MultipartFile> images
    ) {
        SecurityUtil.validateLoginUser(userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("회원을 찾을 수 없습니다."));

        Post post = new Post(
                user,
                request.getTitle(),
                request.getContent(),
                request.getBoardType()
        );

        Post savedPost = postRepository.save(post);

        if (images != null && !images.isEmpty()) {
            int sortOrder = 0;

            for (MultipartFile image : images) {
                if (image == null || image.isEmpty()) {
                    continue;
                }

                String imageUrl = fileStorageService.saveFile(image, "posts");

                boolean thumbnail = sortOrder == 0;

                PostImage postImage = new PostImage(
                        savedPost,
                        imageUrl,
                        sortOrder,
                        thumbnail
                );

                postImageRepository.save(postImage);

                sortOrder++;
            }
        }

        return postResponseAssembler.toDto(savedPost);
    }

    public PostPageResponseDto getPosts(
            BoardType boardType,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Order.desc("createdAt"),
                        Sort.Order.desc("id")
                )
        );

        Page<Post> postPage;

        if (boardType == null) {
            postPage = postRepository.findAll(pageable);
        } else {
            postPage = postRepository.findByBoardType(
                    boardType,
                    pageable
            );
        }

        List<PostResponseDto> content =
                postResponseAssembler.toDtos(postPage.getContent());

        return new PostPageResponseDto(
                content,
                postPage.getNumber(),
                postPage.getSize(),
                postPage.getTotalElements(),
                postPage.getTotalPages(),
                postPage.hasNext(),
                postPage.hasPrevious()
        );
    }

    public List<PopularPostResponseDto> getPopularPosts(
            int limit
    ) {
        int safeLimit =
                Math.max(
                        1,
                        Math.min(limit, 10)
                );

        LocalDateTime since =
                LocalDateTime.now()
                        .minusDays(7);

        Pageable pageable =
                PageRequest.of(
                        0,
                        safeLimit
                );

        List<PopularPostRankingProjection> rankings =
                postRepository
                        .findPopularPostRankings(
                                since,
                                pageable
                        );

        if (rankings.isEmpty()) {
            return List.of();
        }

        List<Long> postIds =
                rankings.stream()
                        .map(
                                PopularPostRankingProjection
                                        ::getPostId
                        )
                        .toList();

        List<Post> fetchedPosts =
                postRepository
                        .findAllByIdIn(postIds);

        Map<Long, Post> postMap =
                new HashMap<>();

        for (Post post : fetchedPosts) {
            postMap.put(
                    post.getId(),
                    post
            );
        }

        /*
         * findAllByIdIn은 DB 반환 순서를 보장하지 않으므로
         * 순위 조회 결과의 ID 순서로 다시 정렬한다.
         */
        List<Post> orderedPosts =
                new ArrayList<>();

        for (
                PopularPostRankingProjection ranking
                : rankings
        ) {
            Post post =
                    postMap.get(
                            ranking.getPostId()
                    );

            if (post != null) {
                orderedPosts.add(post);
            }
        }

        List<PostResponseDto> postResponses =
                postResponseAssembler
                        .toDtos(orderedPosts);

        List<PopularPostResponseDto> responses =
                new ArrayList<>(
                        postResponses.size()
                );

        for (
                int index = 0;
                index < postResponses.size();
                index++
        ) {
            responses.add(
                    new PopularPostResponseDto(
                            index + 1,
                            postResponses.get(index)
                    )
            );
        }

        return responses;
    }

    @Transactional
    public PostResponseDto getPost(
            Long postId
    ) {
        Long loginUserId =
                SecurityUtil
                        .getOptionalLoginUserId()
                        .orElse(null);

        /*
         * 로그인 사용자라면 게시글을 조회하기 전에
         * 사용자 행부터 잠근다.
         *
         * 같은 사용자의 중복 요청은 여기서부터
         * 한 요청씩 순서대로 처리된다.
         */
        User lockedViewer = null;

        if (loginUserId != null) {
            lockedViewer =
                    findActiveUserForUpdate(
                            loginUserId
                    );
        }

        /*
         * 사용자 잠금 이후 게시글을 조회해야
         * 대기 중이던 두 번째 트랜잭션이 앞선 요청의
         * 최신 Commit 상태를 기준으로 동작한다.
         */
        Post post =
                findPostById(postId);

        if (lockedViewer != null) {
            increaseViewCountIfFirstView(
                    post,
                    lockedViewer
            );
        }

        return postResponseAssembler
                .toDto(post);
    }

    @Transactional
    public PostResponseDto updatePost(
            Long postId,
            PostUpdateRequestDto request,
            List<MultipartFile> images
    ) {
        Post post = findPostById(postId);

        SecurityUtil.validateLoginUser(post.getUserId());

        post.update(
                request.getTitle(),
                request.getContent()
        );

        if (hasUploadedImages(images)) {
            postImageRepository.deleteByPost_Id(postId);

            for (int index = 0; index < images.size(); index++) {
                MultipartFile image = images.get(index);

                if (image == null || image.isEmpty()) {
                    continue;
                }

                String imageUrl = fileStorageService.saveFile(image, "posts");
                boolean thumbnail = index == 0;

                PostImage postImage = new PostImage(post, imageUrl, index, thumbnail);
                postImageRepository.save(postImage);
            }
        }

        return postResponseAssembler.toDto(post);
    }

    @Transactional
    public void deletePost(Long postId) {
        Post post = findPostById(postId);

        SecurityUtil.validateLoginUser(post.getUserId());

        postImageRepository.deleteByPost_Id(postId);
        postLikeRepository.deleteByPost_Id(postId);
        commentRepository.deleteByPost_Id(postId);
        postViewRepository.deleteByPost_Id(postId);

        postRepository.delete(post);
    }

    private boolean hasUploadedImages(List<MultipartFile> images) {
        if (images == null || images.isEmpty()) {
            return false;
        }

        return images.stream().anyMatch(image -> image != null && !image.isEmpty());
    }

    private User findActiveUserForUpdate(
            Long userId
    ) {
        User user =
                userRepository
                        .findByIdForUpdate(userId)
                        .orElseThrow(() ->
                                new UserNotFoundException(
                                        "회원을 찾을 수 없습니다."
                                )
                        );

        if (user.getDeletedAt() != null) {
            throw new UserNotFoundException(
                    "회원을 찾을 수 없습니다."
            );
        }

        return user;
    }

    private Post findPostById(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("게시글을 찾을 수 없습니다."));
    }

    private void increaseViewCountIfFirstView(
            Post post,
            User viewer
    ) {
        /*
         * 일반 exists 조회 대신 잠금 조회를 사용한다.
         *
         * 앞선 중복 요청이 조회 기록을 생성했다면
         * 여기서 최신 상태를 확인하고 정상 종료한다.
         */
        boolean alreadyViewed =
                postViewRepository
                        .findByUserIdAndPostIdForUpdate(
                                viewer.getId(),
                                post.getId()
                        )
                        .isPresent();

        if (alreadyViewed) {
            return;
        }

        PostView postView =
                new PostView(
                        viewer,
                        post
                );

        /*
         * 조회 기록을 먼저 반영한다.
         *
         * 이후 조회수 증가가 실패하면 같은 트랜잭션에서
         * 조회 기록과 조회수 변경이 함께 Rollback된다.
         */
        postViewRepository
                .saveAndFlush(postView);

        int updatedRowCount =
                postRepository
                        .incrementViewCount(
                                post.getId()
                        );

        if (updatedRowCount != 1) {
            throw new PostNotFoundException(
                    "게시글을 찾을 수 없습니다."
            );
        }

        /*
         * JPQL UPDATE는 현재 영속성 컨텍스트의
         * Post 객체 값을 자동으로 바꾸지 않는다.
         */
        entityManager.refresh(post);
    }

}
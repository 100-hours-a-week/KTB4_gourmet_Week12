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
import org.springframework.data.domain.Pageable;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

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

    @Transactional
    public PostResponseDto getPost(Long postId) {
        Post post = findPostById(postId);

        SecurityUtil.getOptionalLoginUserId()
                .ifPresent(userId ->
                        increaseViewCountIfFirstView(
                                post,
                                userId
                        )
                );

        return postResponseAssembler.toDto(post);
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

    private Post findPostById(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("게시글을 찾을 수 없습니다."));
    }

    private void increaseViewCountIfFirstView(Post post, Long userId) {
        boolean alreadyViewed =
                postViewRepository
                        .existsByUser_IdAndPost_Id(
                                userId,
                                post.getId()
                        );

        if (alreadyViewed) {
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "회원을 찾을 수 없습니다."
                        )
                );

        PostView postView = new PostView(user, post);
        postViewRepository.save(postView);

        post.increaseViewCount();
    }

/*    private List<PostResponseDto> createPostResponseDtos(
            List<Post> posts
    ) {
        if (posts.isEmpty()) {
            return List.of();
        }

        List<Long> postIds = posts.stream()
                .map(Post::getId)
                .toList();

        Map<Long, Long> likeCountMap =
                postLikeRepository.countByPostIds(postIds)
                        .stream()
                        .collect(Collectors.toMap(
                                projection -> projection.getPostId(),
                                projection -> projection.getTotalCount()
                        ));

        Map<Long, Long> commentCountMap =
                commentRepository.countByPostIds(postIds)
                        .stream()
                        .collect(Collectors.toMap(
                                projection -> projection.getPostId(),
                                projection -> projection.getTotalCount()
                        ));

        Map<Long, List<String>> imageUrlMap =
                postImageRepository.findAllByPostIds(postIds)
                        .stream()
                        .collect(Collectors.groupingBy(
                                image -> image.getPost().getId(),
                                Collectors.mapping(
                                        PostImage::getImageUrl,
                                        Collectors.toList()
                                )
                        ));

        return posts.stream()
                .map(post -> new PostResponseDto(
                        post,
                        likeCountMap.getOrDefault(
                                post.getId(),
                                0L
                        ),
                        commentCountMap.getOrDefault(
                                post.getId(),
                                0L
                        ),
                        imageUrlMap.getOrDefault(
                                post.getId(),
                                List.of()
                        )
                ))
                .toList();
    }

    private PostResponseDto createPostResponseDto(Post post) {
        long likeCount = postLikeRepository.countByPost_Id(post.getId());
        long commentCount = commentRepository.countByPost_Id(post.getId());

        List<String> imageUrls = postImageRepository
                .findByPost_IdAndDeletedAtIsNullOrderBySortOrderAsc(post.getId())
                .stream()
                .map(PostImage::getImageUrl)
                .toList();

        return new PostResponseDto(post, likeCount, commentCount, imageUrls);
    }*/
}
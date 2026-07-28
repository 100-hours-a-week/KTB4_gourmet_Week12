package GourmetCommunity.service.assembler;

import GourmetCommunity.dto.PostResponseDto;
import GourmetCommunity.entity.Post;
import GourmetCommunity.entity.PostImage;
import GourmetCommunity.repository.CommentRepository;
import GourmetCommunity.repository.PostImageRepository;
import GourmetCommunity.repository.PostLikeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PostResponseAssembler {

    private final CommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostImageRepository postImageRepository;

    public List<PostResponseDto> toDtos(
            List<Post> posts
    ) {
        if (posts.isEmpty()) {
            return List.of();
        }

        List<Long> postIds = posts.stream()
                .map(Post::getId)
                .toList();

        Map<Long, Long> likeCountMap =
                postLikeRepository
                        .countByPostIds(postIds)
                        .stream()
                        .collect(Collectors.toMap(
                                projection ->
                                        projection.getPostId(),
                                projection ->
                                        projection.getTotalCount()
                        ));

        Map<Long, Long> commentCountMap =
                commentRepository
                        .countByPostIds(postIds)
                        .stream()
                        .collect(Collectors.toMap(
                                projection ->
                                        projection.getPostId(),
                                projection ->
                                        projection.getTotalCount()
                        ));

        Map<Long, List<String>> imageUrlMap =
                postImageRepository
                        .findAllByPostIds(postIds)
                        .stream()
                        .collect(Collectors.groupingBy(
                                image ->
                                        image.getPost().getId(),
                                Collectors.mapping(
                                        PostImage::getImageUrl,
                                        Collectors.toList()
                                )
                        ));

        return posts.stream()
                .map(post ->
                        new PostResponseDto(
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
                        )
                )
                .toList();
    }

    public PostResponseDto toDto(Post post) {
        long likeCount =
                postLikeRepository
                        .countByPost_Id(post.getId());

        long commentCount =
                commentRepository
                        .countByPost_Id(post.getId());

        List<String> imageUrls =
                postImageRepository
                        .findByPost_IdAndDeletedAtIsNullOrderBySortOrderAsc(
                                post.getId()
                        )
                        .stream()
                        .map(PostImage::getImageUrl)
                        .toList();

        return new PostResponseDto(
                post,
                likeCount,
                commentCount,
                imageUrls
        );
    }
}
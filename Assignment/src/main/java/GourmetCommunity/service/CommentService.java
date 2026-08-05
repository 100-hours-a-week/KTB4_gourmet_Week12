package GourmetCommunity.service;

import GourmetCommunity.dto.CommentCreateRequestDto;
import GourmetCommunity.dto.CommentResponseDto;
import GourmetCommunity.dto.CommentUpdateRequestDto;
import GourmetCommunity.entity.Comment;
import GourmetCommunity.entity.Post;
import GourmetCommunity.entity.User;
import GourmetCommunity.exception.CommentNotFoundException;
import GourmetCommunity.exception.PostNotFoundException;
import GourmetCommunity.exception.UserNotFoundException;
import GourmetCommunity.repository.CommentRepository;
import GourmetCommunity.repository.PostRepository;
import GourmetCommunity.repository.UserRepository;
import GourmetCommunity.auth.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public CommentResponseDto createComment(Long postId, CommentCreateRequestDto request) {
        SecurityUtil.validateLoginUser(request.getUserId());

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("게시글을 찾을 수 없습니다."));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new UserNotFoundException("회원을 찾을 수 없습니다."));

        Comment comment = new Comment(
                post,
                user,
                request.getContent()
        );

        Comment savedComment = commentRepository.save(comment);

        notificationService.createCommentNotification(
                post,
                user,
                savedComment
        );

        return new CommentResponseDto(savedComment);
    }

    public List<CommentResponseDto> getComments(Long postId) {
        postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("게시글을 찾을 수 없습니다."));

        return commentRepository.findByPost_IdOrderByIdAsc(postId)
                .stream()
                .map(CommentResponseDto::new)
                .toList();
    }

    public CommentResponseDto getComment(Long postId, Long commentId) {
        Comment comment = findCommentById(commentId);

        validateCommentBelongsToPost(comment, postId);

        return new CommentResponseDto(comment);
    }

    @Transactional
    public CommentResponseDto updateComment(
            Long postId,
            Long commentId,
            CommentUpdateRequestDto request
    ) {
        Comment comment = findCommentById(commentId);

        validateCommentBelongsToPost(comment, postId);
        SecurityUtil.validateLoginUser(comment.getUserId());

        comment.update(request.getContent());

        return new CommentResponseDto(comment);
    }

    @Transactional
    public void deleteComment(Long postId, Long commentId) {
        Comment comment = findCommentById(commentId);

        validateCommentBelongsToPost(comment, postId);
        SecurityUtil.validateLoginUser(comment.getUserId());

        notificationService.deleteCommentNotification(commentId);

        commentRepository.delete(comment);
    }

    private Comment findCommentById(Long commentId) {
        return commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException("댓글을 찾을 수 없습니다."));
    }

    private void validateCommentBelongsToPost(Comment comment, Long postId) {
        if (!comment.getPostId().equals(postId)) {
            throw new CommentNotFoundException("해당 게시글의 댓글을 찾을 수 없습니다.");
        }
    }
}
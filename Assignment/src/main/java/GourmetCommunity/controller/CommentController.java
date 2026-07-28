package GourmetCommunity.controller;

import GourmetCommunity.dto.CommentCreateRequestDto;
import GourmetCommunity.dto.CommentResponseDto;
import GourmetCommunity.dto.CommentUpdateRequestDto;
import GourmetCommunity.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponseDto createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentCreateRequestDto request
    ) {
        return commentService.createComment(postId, request);
    }

    @GetMapping
    public List<CommentResponseDto> getComments(
            @PathVariable Long postId
    ) {
        return commentService.getComments(postId);
    }

    @GetMapping("/{commentId}")
    public CommentResponseDto getComment(
            @PathVariable Long postId,
            @PathVariable Long commentId
    ) {
        return commentService.getComment(postId, commentId);
    }

    @PatchMapping("/{commentId}")
    public CommentResponseDto updateComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentUpdateRequestDto request
    ) {
        return commentService.updateComment(postId, commentId, request);
    }

    @DeleteMapping("/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(
            @PathVariable Long postId,
            @PathVariable Long commentId
    ) {
        commentService.deleteComment(postId, commentId);
    }
}
package GourmetCommunity.exception;

import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(
            UserNotFoundException.class
    )
    public ResponseEntity<ErrorResponse>
    handleUserNotFoundException(
            UserNotFoundException exception
    ) {
        ErrorResponse response =
                new ErrorResponse(
                        HttpStatus.NOT_FOUND,
                        exception.getMessage()
                );

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(response);
    }

    @ExceptionHandler(
            InvalidLoginException.class
    )
    public ResponseEntity<ErrorResponse>
    handleInvalidLoginException(
            InvalidLoginException exception
    ) {
        ErrorResponse response =
                new ErrorResponse(
                        HttpStatus.UNAUTHORIZED,
                        exception.getMessage()
                );

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(response);
    }

    @ExceptionHandler(
            InvalidUserIdentityException.class
    )
    public ResponseEntity<ErrorResponse>
    handleInvalidUserIdentityException(
            InvalidUserIdentityException exception
    ) {
        ErrorResponse response =
                new ErrorResponse(
                        HttpStatus.BAD_REQUEST,
                        exception.getMessage()
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    @ExceptionHandler(
            PostNotFoundException.class
    )
    public ResponseEntity<ErrorResponse>
    handlePostNotFoundException(
            PostNotFoundException exception
    ) {
        ErrorResponse response =
                new ErrorResponse(
                        HttpStatus.NOT_FOUND,
                        exception.getMessage()
                );

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(response);
    }

    @ExceptionHandler(
            CommentNotFoundException.class
    )
    public ResponseEntity<ErrorResponse>
    handleCommentNotFoundException(
            CommentNotFoundException exception
    ) {
        ErrorResponse response =
                new ErrorResponse(
                        HttpStatus.NOT_FOUND,
                        exception.getMessage()
                );

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(response);
    }

    @ExceptionHandler(
            DuplicateEmailException.class
    )
    public ResponseEntity<ErrorResponse>
    handleDuplicateEmailException(
            DuplicateEmailException exception
    ) {
        ErrorResponse response =
                new ErrorResponse(
                        HttpStatus.CONFLICT,
                        exception.getMessage()
                );

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(response);
    }

    @ExceptionHandler(
            DuplicateNicknameException.class
    )
    public ResponseEntity<ErrorResponse>
    handleDuplicateNicknameException(
            DuplicateNicknameException exception
    ) {
        ErrorResponse response =
                new ErrorResponse(
                        HttpStatus.CONFLICT,
                        exception.getMessage()
                );

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(response);
    }

    @ExceptionHandler(
            MethodArgumentNotValidException.class
    )
    public ResponseEntity<ErrorResponse>
    handleValidationException(
            MethodArgumentNotValidException exception
    ) {
        String message =
                exception
                        .getBindingResult()
                        .getFieldErrors()
                        .stream()
                        .findFirst()
                        .map(error ->
                                error.getDefaultMessage()
                        )
                        .orElse(
                                "요청 값이 올바르지 않습니다."
                        );

        ErrorResponse response =
                new ErrorResponse(
                        HttpStatus.BAD_REQUEST,
                        message
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    @ExceptionHandler(
            ConstraintViolationException.class
    )
    public ResponseEntity<ErrorResponse>
    handleConstraintViolationException(
            ConstraintViolationException exception
    ) {
        String message =
                exception
                        .getConstraintViolations()
                        .stream()
                        .findFirst()
                        .map(violation ->
                                violation.getMessage()
                        )
                        .orElse(
                                "요청 값이 올바르지 않습니다."
                        );

        ErrorResponse response =
                new ErrorResponse(
                        HttpStatus.BAD_REQUEST,
                        message
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    @ExceptionHandler(
            DataIntegrityViolationException.class
    )
    public ResponseEntity<ErrorResponse>
    handleDataIntegrityViolationException(
            DataIntegrityViolationException exception
    ) {
        ErrorResponse response =
                new ErrorResponse(
                        HttpStatus.CONFLICT,
                        "데이터 제약 조건을 위반했습니다."
                );

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(response);
    }

    @ExceptionHandler(
            HttpMessageNotReadableException.class
    )
    public ResponseEntity<ErrorResponse>
    handleHttpMessageNotReadableException(
            HttpMessageNotReadableException exception
    ) {
        ErrorResponse response =
                new ErrorResponse(
                        HttpStatus.BAD_REQUEST,
                        "요청 본문 형식이 올바르지 않습니다."
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    @ExceptionHandler(
            MethodArgumentTypeMismatchException.class
    )
    public ResponseEntity<ErrorResponse>
    handleMethodArgumentTypeMismatchException(
            MethodArgumentTypeMismatchException exception
    ) {
        String message =
                "요청 값이 올바르지 않습니다.";

        if (
                "boardType".equals(
                        exception.getName()
                )
        ) {
            message =
                    "게시판 유형이 올바르지 않습니다. "
                            + "FREE, QUESTION, STUDY, PROJECT 중 하나를 입력해주세요.";
        }

        ErrorResponse response =
                new ErrorResponse(
                        HttpStatus.BAD_REQUEST,
                        message
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    @ExceptionHandler(
            FriendRequestNotFoundException.class
    )
    public ResponseEntity<ErrorResponse>
    handleFriendRequestNotFoundException(
            FriendRequestNotFoundException exception
    ) {
        ErrorResponse response =
                new ErrorResponse(
                        HttpStatus.NOT_FOUND,
                        exception.getMessage()
                );

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(response);
    }

    @ExceptionHandler(
            FriendRequestConflictException.class
    )
    public ResponseEntity<ErrorResponse>
    handleFriendRequestConflictException(
            FriendRequestConflictException exception
    ) {
        ErrorResponse response =
                new ErrorResponse(
                        HttpStatus.CONFLICT,
                        exception.getMessage()
                );

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(response);
    }

    @ExceptionHandler(
            MissingServletRequestParameterException.class
    )
    public ResponseEntity<ErrorResponse>
    handleMissingServletRequestParameterException(
            MissingServletRequestParameterException exception
    ) {
        ErrorResponse response =
                new ErrorResponse(
                        HttpStatus.BAD_REQUEST,
                        "필수 요청 값이 누락되었습니다."
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    @ExceptionHandler(
            MissingServletRequestPartException.class
    )
    public ResponseEntity<ErrorResponse>
    handleMissingServletRequestPartException(
            MissingServletRequestPartException exception
    ) {
        ErrorResponse response =
                new ErrorResponse(
                        HttpStatus.BAD_REQUEST,
                        "필수 요청 파일 또는 데이터가 누락되었습니다."
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    @ExceptionHandler(
            ForbiddenException.class
    )
    public ResponseEntity<ErrorResponse>
    handleForbiddenException(
            ForbiddenException exception
    ) {
        ErrorResponse response =
                new ErrorResponse(
                        HttpStatus.FORBIDDEN,
                        exception.getMessage()
                );

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(response);
    }

    @ExceptionHandler(
            Exception.class
    )
    public ResponseEntity<ErrorResponse>
    handleException(
            Exception exception
    ) {
        ErrorResponse response =
                new ErrorResponse(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "서버 내부 오류가 발생했습니다."
                );

        return ResponseEntity
                .status(
                        HttpStatus.INTERNAL_SERVER_ERROR
                )
                .body(response);
    }

    @ExceptionHandler(
            InvalidChatRoomRequestException.class
    )
    public ResponseEntity<ErrorResponse>
    handleInvalidChatRoomRequestException(
            InvalidChatRoomRequestException exception
    ) {
        ErrorResponse response =
                new ErrorResponse(
                        HttpStatus.BAD_REQUEST,
                        exception.getMessage()
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    @ExceptionHandler(ChatRoomConflictException.class)
    public ResponseEntity<ErrorResponse>
    handleChatRoomConflictException(ChatRoomConflictException exception) {
        ErrorResponse response = new ErrorResponse(HttpStatus.CONFLICT, exception.getMessage());

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(response);
    }

    @ExceptionHandler(
            ChatRoomNotFoundException.class
    )
    public ResponseEntity<ErrorResponse>
    handleChatRoomNotFoundException(
            ChatRoomNotFoundException exception
    ) {
        ErrorResponse response =
                new ErrorResponse(
                        HttpStatus.NOT_FOUND,
                        exception.getMessage()
                );

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(response);
    }

    @ExceptionHandler(
            InvalidChatMessageException.class
    )
    public ResponseEntity<ErrorResponse>
    handleInvalidChatMessageException(
            InvalidChatMessageException exception
    ) {
        ErrorResponse response =
                new ErrorResponse(
                        HttpStatus.BAD_REQUEST,
                        exception.getMessage()
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    @ExceptionHandler(
            ChatMessageConflictException.class
    )
    public ResponseEntity<ErrorResponse>
    handleChatMessageConflictException(
            ChatMessageConflictException exception
    ) {
        ErrorResponse response =
                new ErrorResponse(
                        HttpStatus.CONFLICT,
                        exception.getMessage()
                );

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(response);
    }


}
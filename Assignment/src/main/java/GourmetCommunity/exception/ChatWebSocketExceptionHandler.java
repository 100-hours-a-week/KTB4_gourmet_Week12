package GourmetCommunity.exception;

import GourmetCommunity.dto.chat.ChatWebSocketErrorResponseDto;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.web.bind.annotation.ControllerAdvice;

@ControllerAdvice
public class ChatWebSocketExceptionHandler {

    @MessageExceptionHandler(
            InvalidChatMessageException.class
    )
    @SendToUser(
            destinations = "/queue/chat/errors",
            broadcast = false
    )
    public ChatWebSocketErrorResponseDto
    handleInvalidChatMessage(
            InvalidChatMessageException exception
    ) {
        return ChatWebSocketErrorResponseDto.of(
                "INVALID_CHAT_MESSAGE",
                exception.getMessage()
        );
    }

    @MessageExceptionHandler(
            ChatRoomNotFoundException.class
    )
    @SendToUser(
            destinations = "/queue/chat/errors",
            broadcast = false
    )
    public ChatWebSocketErrorResponseDto
    handleChatRoomNotFound(
            ChatRoomNotFoundException exception
    ) {
        return ChatWebSocketErrorResponseDto.of(
                "CHAT_ROOM_NOT_FOUND",
                exception.getMessage()
        );
    }

    @MessageExceptionHandler(
            ForbiddenException.class
    )
    @SendToUser(
            destinations = "/queue/chat/errors",
            broadcast = false
    )
    public ChatWebSocketErrorResponseDto
    handleForbidden(
            ForbiddenException exception
    ) {
        return ChatWebSocketErrorResponseDto.of(
                "CHAT_FORBIDDEN",
                exception.getMessage()
        );
    }

    @MessageExceptionHandler(
            ChatMessageConflictException.class
    )
    @SendToUser(
            destinations = "/queue/chat/errors",
            broadcast = false
    )
    public ChatWebSocketErrorResponseDto
    handleMessageConflict(
            ChatMessageConflictException exception
    ) {
        return ChatWebSocketErrorResponseDto.of(
                "CHAT_MESSAGE_CONFLICT",
                exception.getMessage()
        );
    }

    @MessageExceptionHandler(
            Exception.class
    )
    @SendToUser(
            destinations = "/queue/chat/errors",
            broadcast = false
    )
    public ChatWebSocketErrorResponseDto
    handleException(
            Exception exception
    ) {
        return ChatWebSocketErrorResponseDto.of(
                "CHAT_INTERNAL_ERROR",
                "채팅 처리 중 오류가 발생했습니다."
        );
    }
}
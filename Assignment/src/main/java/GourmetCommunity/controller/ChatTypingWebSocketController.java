package GourmetCommunity.controller;

import GourmetCommunity.dto.chat.ChatTypingCommandResult;
import GourmetCommunity.dto.chat.ChatTypingRequestDto;
import GourmetCommunity.exception.InvalidChatMessageException;
import GourmetCommunity.service.ChatTypingPublisher;
import GourmetCommunity.service.ChatTypingService;
import GourmetCommunity.websocket.WebSocketUserIdResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatTypingWebSocketController {

    private final ChatTypingService
            chatTypingService;

    private final ChatTypingPublisher
            chatTypingPublisher;

    private final WebSocketUserIdResolver
            webSocketUserIdResolver;

    /*
     * 전송 주소:
     * /app/chat/rooms/{roomId}/typing
     */
    @MessageMapping(
            "/chat/rooms/{roomId}/typing"
    )
    public void updateTyping(
            @DestinationVariable
            Long roomId,

            @Payload
            ChatTypingRequestDto request,

            Principal principal
    ) {
        if (
                request == null
                        || request.typing() == null
        ) {
            throw new InvalidChatMessageException(
                    "입력 상태 정보가 필요합니다."
            );
        }

        Long typingUserId =
                webSocketUserIdResolver
                        .resolve(principal);

        ChatTypingCommandResult result =
                chatTypingService
                        .createEvent(
                                roomId,
                                typingUserId,
                                request.typing()
                        );

        chatTypingPublisher.publish(result);
    }
}
package GourmetCommunity.controller;

import GourmetCommunity.dto.chat.ChatReadCommandResult;
import GourmetCommunity.dto.chat.ChatReadRequestDto;
import GourmetCommunity.exception.InvalidChatMessageException;
import GourmetCommunity.service.ChatReadPublisher;
import GourmetCommunity.service.ChatReadService;
import GourmetCommunity.websocket.WebSocketUserIdResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatReadWebSocketController {

    private final ChatReadService
            chatReadService;

    private final ChatReadPublisher
            chatReadPublisher;

    private final WebSocketUserIdResolver
            webSocketUserIdResolver;

    /*
     * 전송 주소:
     * /app/chat/rooms/{roomId}/read
     */
    @MessageMapping(
            "/chat/rooms/{roomId}/read"
    )
    public void markRead(
            @DestinationVariable
            Long roomId,

            @Payload
            ChatReadRequestDto request,

            Principal principal
    ) {
        if (
                request == null
                        || request.lastReadSequence() == null
        ) {
            throw new InvalidChatMessageException(
                    "읽음 메시지 정보가 필요합니다."
            );
        }

        Long readerId =
                webSocketUserIdResolver
                        .resolve(principal);

        ChatReadCommandResult result =
                chatReadService
                        .markRead(
                                roomId,
                                readerId,
                                request.lastReadSequence()
                        );

        chatReadPublisher.publish(result);
    }
}
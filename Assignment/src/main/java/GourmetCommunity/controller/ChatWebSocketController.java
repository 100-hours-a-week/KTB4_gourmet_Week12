package GourmetCommunity.controller;

import GourmetCommunity.dto.chat.ChatMessageCommandResult;
import GourmetCommunity.dto.chat.ChatMessageSendRequestDto;
import GourmetCommunity.exception.InvalidChatMessageException;
import GourmetCommunity.service.ChatMessageCommandService;
import GourmetCommunity.service.ChatMessagePublisher;
import GourmetCommunity.websocket.WebSocketUserIdResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatMessageCommandService
            chatMessageCommandService;

    private final ChatMessagePublisher
            chatMessagePublisher;

    private final WebSocketUserIdResolver
            webSocketUserIdResolver;

    /*
     * 클라이언트 전송 주소:
     * /app/chat/rooms/{roomId}/messages
     */
    @MessageMapping(
            "/chat/rooms/{roomId}/messages"
    )
    public void sendMessage(
            @DestinationVariable
            Long roomId,

            @Payload
            ChatMessageSendRequestDto request,

            Principal principal
    ) {
        if (request == null) {
            throw new InvalidChatMessageException(
                    "메시지 요청 정보가 필요합니다."
            );
        }

        /*
         * 클라이언트가 senderId를 보내는 것이 아니라,
         * 인증된 Principal에서 서버가 직접 가져온다.
         */
        Long senderId =
                webSocketUserIdResolver
                        .resolve(principal);

        /*
         * Service 메서드가 정상 반환될 때는
         * 메시지 저장 트랜잭션이 완료된 상태다.
         */
        ChatMessageCommandResult result =
                chatMessageCommandService
                        .saveMessage(
                                roomId,
                                senderId,
                                request.clientMessageId(),
                                request.content()
                        );

        /*
         * DB 저장이 성공하고 Commit된 뒤에만
         * WebSocket으로 사용자에게 전달한다.
         */
        chatMessagePublisher
                .publish(result);
    }
}
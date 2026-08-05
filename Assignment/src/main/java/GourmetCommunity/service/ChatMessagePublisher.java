package GourmetCommunity.service;

import GourmetCommunity.dto.chat.ChatMessageCommandResult;
import GourmetCommunity.dto.chat.ChatMessageResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatMessagePublisher {

    private static final String
            MESSAGE_DESTINATION =
            "/queue/chat/messages";

    private final SimpMessagingTemplate
            messagingTemplate;

    public void publish(
            ChatMessageCommandResult result
    ) {
        if (result.created()) {
            /*
             * 새 메시지는 채팅방 참여자 두 명의
             * 모든 활성 WebSocket 세션에 전달한다.
             */
            sendToUser(
                    result.userAId(),
                    result.message()
            );

            sendToUser(
                    result.userBId(),
                    result.message()
            );

            return;
        }

        /*
         * 동일 clientMessageId 재전송이면
         * 상대에게 같은 메시지를 다시 보내지 않는다.
         *
         * 보낸 사람에게만 기존 저장 결과를 보내
         * 클라이언트 임시 메시지를 확정할 수 있게 한다.
         */
        sendToUser(
                result.message().senderId(),
                result.message()
        );
    }

    private void sendToUser(
            Long userId,
            ChatMessageResponseDto message
    ) {
        messagingTemplate
                .convertAndSendToUser(
                        String.valueOf(userId),
                        MESSAGE_DESTINATION,
                        message
                );
    }
}
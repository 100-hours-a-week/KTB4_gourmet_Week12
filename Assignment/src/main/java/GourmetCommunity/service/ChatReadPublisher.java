package GourmetCommunity.service;

import GourmetCommunity.dto.chat.ChatReadCommandResult;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatReadPublisher {

    private static final String
            READ_DESTINATION =
            "/queue/chat/read";

    private final SimpMessagingTemplate
            messagingTemplate;

    public void publish(
            ChatReadCommandResult result
    ) {
        /*
         * 동일하거나 더 작은 읽음 요청은
         * DB 값이 바뀌지 않았으므로 다시 전송하지 않는다.
         */
        if (!result.changed()) {
            return;
        }

        sendToUser(
                result.userAId(),
                result
        );

        sendToUser(
                result.userBId(),
                result
        );
    }

    private void sendToUser(
            Long userId,
            ChatReadCommandResult result
    ) {
        messagingTemplate.convertAndSendToUser(
                String.valueOf(userId),
                READ_DESTINATION,
                result.event()
        );
    }
}
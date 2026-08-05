package GourmetCommunity.service;

import GourmetCommunity.dto.chat.ChatTypingCommandResult;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatTypingPublisher {

    private static final String
            TYPING_DESTINATION =
            "/queue/chat/typing";

    private final SimpMessagingTemplate
            messagingTemplate;

    public void publish(
            ChatTypingCommandResult result
    ) {
        messagingTemplate.convertAndSendToUser(
                String.valueOf(
                        result.receiverId()
                ),
                TYPING_DESTINATION,
                result.event()
        );
    }
}
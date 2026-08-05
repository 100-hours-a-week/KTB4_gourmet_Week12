package GourmetCommunity.service;

import GourmetCommunity.dto.chat.ChatPresenceEventDto;
import GourmetCommunity.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatPresencePublisher {

    private static final String
            PRESENCE_DESTINATION =
            "/queue/chat/presence";

    private final SimpMessagingTemplate
            messagingTemplate;

    private final ChatRoomRepository
            chatRoomRepository;

    public void publishToPartners(
            Long userId,
            boolean online
    ) {
        List<Long> partnerUserIds =
                chatRoomRepository
                        .findPartnerUserIds(userId);

        ChatPresenceEventDto event =
                new ChatPresenceEventDto(
                        userId,
                        online
                );

        for (Long partnerUserId : partnerUserIds) {
            messagingTemplate
                    .convertAndSendToUser(
                            String.valueOf(
                                    partnerUserId
                            ),
                            PRESENCE_DESTINATION,
                            event
                    );
        }
    }
}
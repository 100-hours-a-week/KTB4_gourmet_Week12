package GourmetCommunity.service;

import GourmetCommunity.auth.SecurityUtil;
import GourmetCommunity.dto.chat.ChatPresenceEventDto;
import GourmetCommunity.repository.ChatRoomRepository;
import GourmetCommunity.websocket.ChatPresenceRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatPresenceQueryService {

    private final ChatRoomRepository
            chatRoomRepository;

    private final ChatPresenceRegistry
            chatPresenceRegistry;

    public List<ChatPresenceEventDto>
    getPartnerPresence() {
        Long loginUserId =
                SecurityUtil.getLoginUserId();

        return chatRoomRepository
                .findPartnerUserIds(
                        loginUserId
                )
                .stream()
                .map(userId ->
                        new ChatPresenceEventDto(
                                userId,
                                chatPresenceRegistry
                                        .isOnline(userId)
                        )
                )
                .toList();
    }
}
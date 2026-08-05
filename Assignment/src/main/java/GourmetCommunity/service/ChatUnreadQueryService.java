package GourmetCommunity.service;

import GourmetCommunity.auth.SecurityUtil;
import GourmetCommunity.dto.chat.ChatUnreadCountResponseDto;
import GourmetCommunity.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatUnreadQueryService {

    private final ChatMessageRepository
            chatMessageRepository;

    public ChatUnreadCountResponseDto
    getUnreadCount() {
        Long loginUserId =
                SecurityUtil.getLoginUserId();

        long unreadCount =
                chatMessageRepository
                        .countUnreadMessagesByUserId(
                                loginUserId
                        );

        return new ChatUnreadCountResponseDto(
                unreadCount
        );
    }
}
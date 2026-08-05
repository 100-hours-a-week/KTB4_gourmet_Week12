package GourmetCommunity.service;

import GourmetCommunity.dto.chat.ChatTypingCommandResult;
import GourmetCommunity.dto.chat.ChatTypingEventDto;
import GourmetCommunity.entity.ChatRoom;
import GourmetCommunity.exception.ChatRoomNotFoundException;
import GourmetCommunity.exception.ForbiddenException;
import GourmetCommunity.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatTypingService {

    private final ChatRoomRepository
            chatRoomRepository;

    public ChatTypingCommandResult createEvent(
            Long roomId,
            Long typingUserId,
            boolean typing
    ) {
        ChatRoom chatRoom =
                chatRoomRepository
                        .findByIdWithUsers(roomId)
                        .orElseThrow(() ->
                                new ChatRoomNotFoundException(
                                        "채팅방을 찾을 수 없습니다."
                                )
                        );

        if (!chatRoom.containsUser(typingUserId)) {
            throw new ForbiddenException(
                    "채팅방 접근 권한이 없습니다."
            );
        }

        Long receiverId =
                chatRoom
                        .getOtherUser(
                                typingUserId
                        )
                        .getId();

        ChatTypingEventDto event =
                new ChatTypingEventDto(
                        roomId,
                        typingUserId,
                        typing
                );

        return new ChatTypingCommandResult(
                event,
                receiverId
        );
    }
}
package GourmetCommunity.service;

import GourmetCommunity.dto.chat.ChatReadCommandResult;
import GourmetCommunity.dto.chat.ChatReadEventDto;
import GourmetCommunity.entity.ChatReadState;
import GourmetCommunity.entity.ChatRoom;
import GourmetCommunity.exception.ChatRoomNotFoundException;
import GourmetCommunity.exception.ForbiddenException;
import GourmetCommunity.exception.InvalidChatMessageException;
import GourmetCommunity.repository.ChatMessageRepository;
import GourmetCommunity.repository.ChatReadStateRepository;
import GourmetCommunity.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ChatReadService {

    private final ChatRoomRepository
            chatRoomRepository;

    private final ChatMessageRepository
            chatMessageRepository;

    private final ChatReadStateRepository
            chatReadStateRepository;

    @Transactional
    public ChatReadCommandResult markRead(
            Long roomId,
            Long readerId,
            Long lastReadSequence
    ) {
        validateRequest(
                roomId,
                readerId,
                lastReadSequence
        );

        ChatRoom chatRoom =
                chatRoomRepository
                        .findByIdWithUsers(roomId)
                        .orElseThrow(() ->
                                new ChatRoomNotFoundException(
                                        "채팅방을 찾을 수 없습니다."
                                )
                        );

        if (!chatRoom.containsUser(readerId)) {
            throw new ForbiddenException(
                    "채팅방 접근 권한이 없습니다."
            );
        }

        long maxSequence =
                chatMessageRepository
                        .findMaxSequenceByRoomId(roomId);

        if (lastReadSequence > maxSequence) {
            throw new InvalidChatMessageException(
                    "존재하지 않는 메시지까지 읽음 처리할 수 없습니다."
            );
        }

        LocalDateTime readAt =
                LocalDateTime.now();

        int updatedRowCount = 0;

        if (lastReadSequence > 0) {
            updatedRowCount =
                    chatReadStateRepository
                            .advanceReadSequence(
                                    roomId,
                                    readerId,
                                    lastReadSequence,
                                    readAt
                            );
        }

        ChatReadState readState =
                chatReadStateRepository
                        .findByRoom_IdAndUser_Id(
                                roomId,
                                readerId
                        )
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "채팅 읽음 상태가 초기화되지 않았습니다."
                                )
                        );

        ChatReadEventDto event =
                new ChatReadEventDto(
                        roomId,
                        readerId,
                        readState.getLastReadSequence(),
                        readState.getLastReadAt()
                );

        return new ChatReadCommandResult(
                event,
                chatRoom.getUserA().getId(),
                chatRoom.getUserB().getId(),
                updatedRowCount == 1
        );
    }

    private void validateRequest(
            Long roomId,
            Long readerId,
            Long sequence
    ) {
        if (roomId == null || roomId < 1) {
            throw new InvalidChatMessageException(
                    "채팅방 번호가 올바르지 않습니다."
            );
        }

        if (readerId == null || readerId < 1) {
            throw new InvalidChatMessageException(
                    "읽음 사용자 정보가 올바르지 않습니다."
            );
        }

        if (sequence == null || sequence < 0) {
            throw new InvalidChatMessageException(
                    "읽음 메시지 순서가 올바르지 않습니다."
            );
        }
    }
}
package GourmetCommunity.service;

import GourmetCommunity.dto.chat.ChatMessageCommandResult;
import GourmetCommunity.dto.chat.ChatMessageResponseDto;
import GourmetCommunity.entity.ChatMessage;
import GourmetCommunity.entity.ChatRoom;
import GourmetCommunity.entity.User;
import GourmetCommunity.exception.ChatMessageConflictException;
import GourmetCommunity.exception.ChatRoomNotFoundException;
import GourmetCommunity.exception.ForbiddenException;
import GourmetCommunity.exception.InvalidChatMessageException;
import GourmetCommunity.repository.ChatMessageRepository;
import GourmetCommunity.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatMessageCommandService {

    private final ChatRoomRepository
            chatRoomRepository;

    private final ChatMessageRepository
            chatMessageRepository;

    @Transactional
    public ChatMessageCommandResult saveMessage(
            Long roomId,
            Long senderId,
            String clientMessageId,
            String content
    ) {
        validateRequest(
                roomId,
                senderId,
                clientMessageId,
                content
        );

        /*
         * 같은 채팅방의 메시지 저장을 직렬화한다.
         *
         * sequence 발급과 메시지 저장이 모두
         * 하나의 채팅방 잠금 안에서 수행된다.
         */
        ChatRoom chatRoom =
                chatRoomRepository
                        .findByIdForUpdate(roomId)
                        .orElseThrow(() ->
                                new ChatRoomNotFoundException(
                                        "채팅방을 찾을 수 없습니다."
                                )
                        );

        if (
                !chatRoom.containsUser(
                        senderId
                )
        ) {
            throw new ForbiddenException(
                    "채팅방 접근 권한이 없습니다."
            );
        }

        User sender =
                resolveSender(
                        chatRoom,
                        senderId
                );

        if (sender.getDeletedAt() != null) {
            throw new ForbiddenException(
                    "채팅을 이용할 수 없는 회원입니다."
            );
        }

        /*
         * 네트워크 지연이나 재연결 때문에
         * 같은 요청이 다시 들어온 경우다.
         *
         * 동일 메시지를 새로 저장하지 않고
         * 기존 DB 메시지를 반환한다.
         */
        ChatMessage duplicatedMessage =
                chatMessageRepository
                        .findDuplicateForUpdate(
                                roomId,
                                senderId,
                                clientMessageId
                        )
                        .orElse(null);

        if (duplicatedMessage != null) {
            return ChatMessageCommandResult
                    .duplicated(
                            ChatMessageResponseDto.from(
                                    duplicatedMessage
                            ),
                            chatRoom
                                    .getUserA()
                                    .getId(),
                            chatRoom
                                    .getUserB()
                                    .getId()
                    );
        }

        long sequence =
                chatRoom
                        .issueNextMessageSequence();

        ChatMessage message =
                new ChatMessage(
                        chatRoom,
                        sender,
                        sequence,
                        clientMessageId,
                        content.strip()
                );

        try {
            ChatMessage savedMessage =
                    chatMessageRepository
                            .saveAndFlush(message);

            return ChatMessageCommandResult
                    .created(
                            ChatMessageResponseDto.from(
                                    savedMessage
                            ),
                            chatRoom
                                    .getUserA()
                                    .getId(),
                            chatRoom
                                    .getUserB()
                                    .getId()
                    );
        } catch (
                DataIntegrityViolationException exception
        ) {
            throw new ChatMessageConflictException(
                    "메시지 저장 중 충돌이 발생했습니다.",
                    exception
            );
        }
    }

    private User resolveSender(
            ChatRoom chatRoom,
            Long senderId
    ) {
        if (
                chatRoom.getUserA()
                        .getId()
                        .equals(senderId)
        ) {
            return chatRoom.getUserA();
        }

        if (
                chatRoom.getUserB()
                        .getId()
                        .equals(senderId)
        ) {
            return chatRoom.getUserB();
        }

        throw new ForbiddenException(
                "채팅방 접근 권한이 없습니다."
        );
    }

    private void validateRequest(
            Long roomId,
            Long senderId,
            String clientMessageId,
            String content
    ) {
        if (roomId == null || roomId < 1) {
            throw new InvalidChatMessageException(
                    "채팅방 번호가 올바르지 않습니다."
            );
        }

        if (senderId == null || senderId < 1) {
            throw new InvalidChatMessageException(
                    "발신자 정보가 올바르지 않습니다."
            );
        }

        validateClientMessageId(
                clientMessageId
        );

        if (
                content == null
                        || content.isBlank()
        ) {
            throw new InvalidChatMessageException(
                    "메시지 내용을 입력해주세요."
            );
        }

        if (content.strip().length() > 2000) {
            throw new InvalidChatMessageException(
                    "메시지는 2000자 이하로 입력해주세요."
            );
        }
    }

    private void validateClientMessageId(
            String clientMessageId
    ) {
        if (
                clientMessageId == null
                        || clientMessageId.isBlank()
        ) {
            throw new InvalidChatMessageException(
                    "클라이언트 메시지 ID가 필요합니다."
            );
        }

        try {
            UUID.fromString(
                    clientMessageId
            );
        } catch (
                IllegalArgumentException exception
        ) {
            throw new InvalidChatMessageException(
                    "클라이언트 메시지 ID 형식이 올바르지 않습니다."
            );
        }
    }
}
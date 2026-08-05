package GourmetCommunity.service;

import GourmetCommunity.auth.SecurityUtil;
import GourmetCommunity.dto.chat.ChatReadStateResponseDto;
import GourmetCommunity.entity.ChatReadState;
import GourmetCommunity.entity.ChatRoom;
import GourmetCommunity.entity.User;
import GourmetCommunity.exception.ChatRoomNotFoundException;
import GourmetCommunity.exception.ForbiddenException;
import GourmetCommunity.exception.InvalidChatMessageException;
import GourmetCommunity.repository.ChatReadStateRepository;
import GourmetCommunity.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatReadQueryService {

    private final ChatRoomRepository
            chatRoomRepository;

    private final ChatReadStateRepository
            chatReadStateRepository;

    public ChatReadStateResponseDto getReadState(
            Long roomId
    ) {
        validateRoomId(roomId);

        Long loginUserId =
                SecurityUtil.getLoginUserId();

        ChatRoom chatRoom =
                chatRoomRepository
                        .findByIdWithUsers(roomId)
                        .orElseThrow(() ->
                                new ChatRoomNotFoundException(
                                        "채팅방을 찾을 수 없습니다."
                                )
                        );

        if (
                !chatRoom.containsUser(
                        loginUserId
                )
        ) {
            throw new ForbiddenException(
                    "채팅방 접근 권한이 없습니다."
            );
        }

        User otherUser =
                chatRoom.getOtherUser(
                        loginUserId
                );

        if (otherUser.getDeletedAt() != null) {
            throw new ChatRoomNotFoundException(
                    "채팅방을 찾을 수 없습니다."
            );
        }

        ChatReadState currentUserReadState =
                findReadState(
                        roomId,
                        loginUserId
                );

        ChatReadState otherUserReadState =
                findReadState(
                        roomId,
                        otherUser.getId()
                );

        return new ChatReadStateResponseDto(
                roomId,

                loginUserId,
                currentUserReadState
                        .getLastReadSequence(),

                otherUser.getId(),
                otherUserReadState
                        .getLastReadSequence()
        );
    }

    private ChatReadState findReadState(
            Long roomId,
            Long userId
    ) {
        return chatReadStateRepository
                .findByRoom_IdAndUser_Id(
                        roomId,
                        userId
                )
                .orElseThrow(() ->
                        new IllegalStateException(
                                "채팅 읽음 상태가 초기화되지 않았습니다."
                        )
                );
    }

    private void validateRoomId(
            Long roomId
    ) {
        if (
                roomId == null
                        || roomId < 1
        ) {
            throw new InvalidChatMessageException(
                    "채팅방 번호가 올바르지 않습니다."
            );
        }
    }
}
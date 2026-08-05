package GourmetCommunity.service;

import GourmetCommunity.auth.SecurityUtil;
import GourmetCommunity.dto.chat.*;
import GourmetCommunity.entity.ChatMessage;
import GourmetCommunity.entity.ChatRoom;
import GourmetCommunity.entity.User;
import GourmetCommunity.exception.ChatRoomNotFoundException;
import GourmetCommunity.exception.ForbiddenException;
import GourmetCommunity.exception.InvalidChatMessageException;
import GourmetCommunity.repository.ChatMessageRepository;
import GourmetCommunity.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatRoomQueryService {

    private static final int
            MAX_ROOM_PAGE_SIZE = 50;

    private static final int
            MAX_MESSAGE_PAGE_SIZE = 100;

    private final ChatRoomRepository
            chatRoomRepository;

    private final ChatMessageRepository
            chatMessageRepository;

    private final ChatRoomSummaryAssembler
            chatRoomSummaryAssembler;

    public ChatRoomPageResponseDto getChatRooms(
            int page,
            int size
    ) {
        Long loginUserId =
                SecurityUtil.getLoginUserId();

        int safePage =
                Math.max(page, 0);

        int safeSize =
                Math.max(
                        1,
                        Math.min(
                                size,
                                MAX_ROOM_PAGE_SIZE
                        )
                );

        Page<ChatRoom> roomPage =
                chatRoomRepository
                        .findChatRoomPageByUserId(
                                loginUserId,
                                PageRequest.of(
                                        safePage,
                                        safeSize
                                )
                        );

        List<ChatRoomSummaryResponseDto> content =
                chatRoomSummaryAssembler
                        .toDtos(
                                roomPage.getContent(),
                                loginUserId
                        );

        return new ChatRoomPageResponseDto(
                content,
                roomPage.getNumber(),
                roomPage.getSize(),
                roomPage.getTotalElements(),
                roomPage.getTotalPages(),
                roomPage.hasNext(),
                roomPage.hasPrevious()
        );
    }

    public ChatMessagePageResponseDto
    getMessages(
            Long roomId,
            Long beforeSequence,
            int size
    ) {
        Long loginUserId =
                SecurityUtil.getLoginUserId();

        validateMessageQuery(
                roomId,
                beforeSequence
        );

        ChatRoom chatRoom =
                findAccessibleRoom(
                        roomId,
                        loginUserId
                );

        int safeSize =
                Math.max(
                        1,
                        Math.min(
                                size,
                                MAX_MESSAGE_PAGE_SIZE
                        )
                );

        PageRequest pageable =
                PageRequest.of(
                        0,
                        safeSize + 1
                );

        List<ChatMessage> fetchedMessages;

        if (beforeSequence == null) {
            fetchedMessages =
                    chatMessageRepository
                            .findLatestMessages(
                                    chatRoom.getId(),
                                    pageable
                            );
        } else {
            fetchedMessages =
                    chatMessageRepository
                            .findMessagesBefore(
                                    chatRoom.getId(),
                                    beforeSequence,
                                    pageable
                            );
        }

        boolean hasMore =
                fetchedMessages.size()
                        > safeSize;

        List<ChatMessage> pageMessages =
                new ArrayList<>(
                        fetchedMessages.subList(
                                0,
                                Math.min(
                                        safeSize,
                                        fetchedMessages.size()
                                )
                        )
                );

        /*
         * DB에서는 최신 메시지부터 조회하지만
         * 화면에는 오래된 메시지부터 전달한다.
         */
        Collections.reverse(pageMessages);

        List<ChatMessageResponseDto> content =
                pageMessages
                        .stream()
                        .map(
                                ChatMessageResponseDto
                                        ::from
                        )
                        .toList();

        Long nextBeforeSequence =
                pageMessages.isEmpty()
                        ? null
                        : pageMessages
                        .get(0)
                        .getSequence();

        return new ChatMessagePageResponseDto(
                content,
                nextBeforeSequence,
                hasMore
        );
    }

    private ChatRoom findAccessibleRoom(
            Long roomId,
            Long loginUserId
    ) {
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

        return chatRoom;
    }

    private void validateMessageQuery(
            Long roomId,
            Long beforeSequence
    ) {
        if (roomId == null || roomId < 1) {
            throw new InvalidChatMessageException(
                    "채팅방 번호가 올바르지 않습니다."
            );
        }

        if (
                beforeSequence != null
                        && beforeSequence < 1
        ) {
            throw new InvalidChatMessageException(
                    "메시지 조회 기준이 올바르지 않습니다."
            );
        }
    }
}
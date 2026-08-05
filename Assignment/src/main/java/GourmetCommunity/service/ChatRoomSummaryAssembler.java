package GourmetCommunity.service;

import GourmetCommunity.dto.chat.ChatRoomSummaryResponseDto;
import GourmetCommunity.entity.ChatMessage;
import GourmetCommunity.entity.ChatRoom;
import GourmetCommunity.repository.ChatMessageRepository;
import GourmetCommunity.repository.projection.ChatRoomUnreadCountProjection;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ChatRoomSummaryAssembler {

    private final ChatMessageRepository
            chatMessageRepository;

    public List<ChatRoomSummaryResponseDto>
    toDtos(
            List<ChatRoom> chatRooms,
            Long loginUserId
    ) {
        if (chatRooms.isEmpty()) {
            return List.of();
        }

        List<Long> roomIds =
                chatRooms
                        .stream()
                        .map(ChatRoom::getId)
                        .toList();

        Map<Long, ChatMessage>
                latestMessageByRoomId =
                loadLatestMessageMap(
                        roomIds
                );

        Map<Long, Long>
                unreadCountByRoomId =
                loadUnreadCountMap(
                        roomIds,
                        loginUserId
                );

        return chatRooms
                .stream()
                .map(chatRoom ->
                        ChatRoomSummaryResponseDto
                                .from(
                                        chatRoom,
                                        loginUserId,

                                        latestMessageByRoomId
                                                .get(
                                                        chatRoom
                                                                .getId()
                                                ),

                                        unreadCountByRoomId
                                                .getOrDefault(
                                                        chatRoom
                                                                .getId(),
                                                        0L
                                                )
                                )
                )
                .toList();
    }

    private Map<Long, ChatMessage>
    loadLatestMessageMap(
            List<Long> roomIds
    ) {
        List<ChatMessage> messages =
                chatMessageRepository
                        .findLatestMessagesByRoomIds(
                                roomIds
                        );

        Map<Long, ChatMessage> result =
                new HashMap<>();

        for (ChatMessage message : messages) {
            result.put(
                    message
                            .getRoom()
                            .getId(),
                    message
            );
        }

        return result;
    }

    private Map<Long, Long>
    loadUnreadCountMap(
            List<Long> roomIds,
            Long loginUserId
    ) {
        List<ChatRoomUnreadCountProjection>
                unreadCounts =
                chatMessageRepository
                        .findUnreadCountsByRoomIds(
                                roomIds,
                                loginUserId
                        );

        Map<Long, Long> result =
                new HashMap<>();

        for (
                ChatRoomUnreadCountProjection
                        unreadCount
                : unreadCounts
        ) {
            result.put(
                    unreadCount.getRoomId(),

                    unreadCount
                            .getUnreadCount()
            );
        }

        return result;
    }
}
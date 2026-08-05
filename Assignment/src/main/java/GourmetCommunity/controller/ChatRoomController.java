package GourmetCommunity.controller;

import GourmetCommunity.dto.chat.ChatMessagePageResponseDto;
import GourmetCommunity.dto.chat.ChatRoomPageResponseDto;
import GourmetCommunity.dto.chat.ChatRoomResponseDto;
import GourmetCommunity.service.ChatRoomQueryService;
import GourmetCommunity.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chat/rooms")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService
            chatRoomService;

    private final ChatRoomQueryService
            chatRoomQueryService;

    @PostMapping(
            "/friends/{friendUserId}"
    )
    public ChatRoomResponseDto
    getOrCreateFriendChatRoom(
            @PathVariable
            Long friendUserId
    ) {
        return chatRoomService
                .getOrCreateFriendChatRoom(
                        friendUserId
                );
    }

    @GetMapping
    public ChatRoomPageResponseDto
    getChatRooms(
            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "20"
            )
            int size
    ) {
        return chatRoomQueryService
                .getChatRooms(
                        page,
                        size
                );
    }

    @GetMapping(
            "/{roomId}/messages"
    )
    public ChatMessagePageResponseDto
    getMessages(
            @PathVariable
            Long roomId,

            @RequestParam(
                    required = false
            )
            Long beforeSequence,

            @RequestParam(
                    defaultValue = "50"
            )
            int size
    ) {
        return chatRoomQueryService
                .getMessages(
                        roomId,
                        beforeSequence,
                        size
                );
    }
}
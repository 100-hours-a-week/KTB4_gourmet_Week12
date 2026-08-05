package GourmetCommunity.controller;

import GourmetCommunity.dto.chat.ChatReadStateResponseDto;
import GourmetCommunity.service.ChatReadQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chat/rooms")
@RequiredArgsConstructor
public class ChatReadQueryController {

    private final ChatReadQueryService
            chatReadQueryService;

    @GetMapping("/{roomId}/read-state")
    public ChatReadStateResponseDto getReadState(
            @PathVariable
            Long roomId
    ) {
        return chatReadQueryService
                .getReadState(roomId);
    }
}
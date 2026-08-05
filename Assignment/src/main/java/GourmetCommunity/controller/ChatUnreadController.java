package GourmetCommunity.controller;

import GourmetCommunity.dto.chat.ChatUnreadCountResponseDto;
import GourmetCommunity.service.ChatUnreadQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatUnreadController {

    private final ChatUnreadQueryService
            chatUnreadQueryService;

    @GetMapping("/unread-count")
    public ChatUnreadCountResponseDto
    getUnreadCount() {
        return chatUnreadQueryService
                .getUnreadCount();
    }
}
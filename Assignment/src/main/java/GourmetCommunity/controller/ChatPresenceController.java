package GourmetCommunity.controller;

import GourmetCommunity.dto.chat.ChatPresenceEventDto;
import GourmetCommunity.service.ChatPresenceQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chat/presence")
@RequiredArgsConstructor
public class ChatPresenceController {

    private final ChatPresenceQueryService
            chatPresenceQueryService;

    @GetMapping
    public List<ChatPresenceEventDto>
    getPartnerPresence() {
        return chatPresenceQueryService
                .getPartnerPresence();
    }
}
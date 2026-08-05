package GourmetCommunity.dto.chat;

import java.util.List;

public record ChatMessagePageResponseDto(
        List<ChatMessageResponseDto> content,
        Long nextBeforeSequence,
        boolean hasMore
) {
}
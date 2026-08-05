package GourmetCommunity.dto.chat;

import java.time.LocalDateTime;

public record ChatReadEventDto(
        Long roomId,
        Long readerId,
        Long lastReadSequence,
        LocalDateTime readAt
) {
}
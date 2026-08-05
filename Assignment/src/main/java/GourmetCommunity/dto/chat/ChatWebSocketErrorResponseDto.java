package GourmetCommunity.dto.chat;

import java.time.LocalDateTime;

public record ChatWebSocketErrorResponseDto(
        String code,
        String message,
        LocalDateTime occurredAt
) {

    public static ChatWebSocketErrorResponseDto of(
            String code,
            String message
    ) {
        return new ChatWebSocketErrorResponseDto(
                code,
                message,
                LocalDateTime.now()
        );
    }
}
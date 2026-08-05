package GourmetCommunity.dto.chat;

import java.util.List;

public record ChatRoomPageResponseDto(
        List<ChatRoomSummaryResponseDto> content,

        int page,
        int size,

        long totalElements,
        int totalPages,

        boolean hasNext,
        boolean hasPrevious
) {
}
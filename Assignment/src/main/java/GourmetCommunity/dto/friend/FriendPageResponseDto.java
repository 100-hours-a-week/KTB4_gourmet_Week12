package GourmetCommunity.dto.friend;

import lombok.Getter;

import java.util.List;

@Getter
public class FriendPageResponseDto {

    private final List<FriendListItemResponseDto>
            content;

    private final int page;
    private final int size;

    private final long totalElements;
    private final int totalPages;

    private final boolean hasNext;
    private final boolean hasPrevious;

    public FriendPageResponseDto(
            List<FriendListItemResponseDto> content,
            int page,
            int size,
            long totalElements,
            int totalPages,
            boolean hasNext,
            boolean hasPrevious
    ) {
        this.content = content;

        this.page = page;
        this.size = size;

        this.totalElements =
                totalElements;

        this.totalPages =
                totalPages;

        this.hasNext = hasNext;
        this.hasPrevious =
                hasPrevious;
    }
}
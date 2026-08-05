package GourmetCommunity.dto.friend;

import GourmetCommunity.entity.FriendRequest;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
public class FriendRequestPageResponseDto {

    private final List<FriendRequestResponseDto>
            content;

    private final int page;
    private final int size;

    private final long totalElements;
    private final int totalPages;

    private final boolean hasNext;
    private final boolean hasPrevious;

    public FriendRequestPageResponseDto(
            Page<FriendRequest> requestPage
    ) {
        this.content =
                requestPage.getContent()
                        .stream()
                        .map(
                                FriendRequestResponseDto
                                        ::new
                        )
                        .toList();

        this.page =
                requestPage.getNumber();

        this.size =
                requestPage.getSize();

        this.totalElements =
                requestPage
                        .getTotalElements();

        this.totalPages =
                requestPage
                        .getTotalPages();

        this.hasNext =
                requestPage.hasNext();

        this.hasPrevious =
                requestPage.hasPrevious();
    }
}
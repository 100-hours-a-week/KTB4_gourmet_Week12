package GourmetCommunity.dto.friend;

import GourmetCommunity.entity.FriendRequest;
import GourmetCommunity.entity.FriendRequestStatus;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class FriendRequestResponseDto {

    private final Long requestId;

    private final FriendUserSummaryResponseDto
            sender;

    private final FriendUserSummaryResponseDto
            receiver;

    private final FriendRequestStatus status;

    private final LocalDateTime createdAt;
    private final LocalDateTime respondedAt;

    public FriendRequestResponseDto(
            FriendRequest request
    ) {
        this.requestId =
                request.getId();

        this.sender =
                new FriendUserSummaryResponseDto(
                        request.getSender()
                );

        this.receiver =
                new FriendUserSummaryResponseDto(
                        request.getReceiver()
                );

        this.status =
                request.getStatus();

        this.createdAt =
                request.getCreatedAt();

        this.respondedAt =
                request.getRespondedAt();
    }
}
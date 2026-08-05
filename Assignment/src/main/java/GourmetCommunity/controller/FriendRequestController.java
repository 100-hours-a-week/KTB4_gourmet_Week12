package GourmetCommunity.controller;

import GourmetCommunity.dto.friend.FriendRequestPageResponseDto;
import GourmetCommunity.dto.friend.FriendRequestResponseDto;
import GourmetCommunity.service.FriendRequestService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/friend-requests")
@RequiredArgsConstructor
@Validated
public class FriendRequestController {

    private final FriendRequestService
            friendRequestService;

    @PostMapping("/{receiverId}")
    @ResponseStatus(HttpStatus.CREATED)
    public FriendRequestResponseDto
    sendRequest(
            @PathVariable
            @Positive(
                    message =
                            "receiverId는 양수여야 합니다."
            )
            Long receiverId
    ) {
        return friendRequestService
                .sendRequest(receiverId);
    }

    @PatchMapping("/{requestId}/accept")
    public FriendRequestResponseDto
    acceptRequest(
            @PathVariable
            @Positive(
                    message =
                            "requestId는 양수여야 합니다."
            )
            Long requestId
    ) {
        return friendRequestService
                .acceptRequest(requestId);
    }

    @PatchMapping("/{requestId}/reject")
    public FriendRequestResponseDto
    rejectRequest(
            @PathVariable
            @Positive(
                    message =
                            "requestId는 양수여야 합니다."
            )
            Long requestId
    ) {
        return friendRequestService
                .rejectRequest(requestId);
    }

    @PatchMapping("/{requestId}/cancel")
    public FriendRequestResponseDto
    cancelRequest(
            @PathVariable
            @Positive(
                    message =
                            "requestId는 양수여야 합니다."
            )
            Long requestId
    ) {
        return friendRequestService
                .cancelRequest(requestId);
    }

    @GetMapping("/received")
    public FriendRequestPageResponseDto
    getReceivedRequests(
            @RequestParam(defaultValue = "0")
            @Min(
                    value = 0,
                    message =
                            "page는 0 이상이어야 합니다."
            )
            int page,

            @RequestParam(defaultValue = "20")
            @Min(
                    value = 1,
                    message =
                            "size는 1 이상이어야 합니다."
            )
            @Max(
                    value = 20,
                    message =
                            "size는 20 이하여야 합니다."
            )
            int size
    ) {
        return friendRequestService
                .getReceivedRequests(
                        page,
                        size
                );
    }

    @GetMapping("/sent")
    public FriendRequestPageResponseDto
    getSentRequests(
            @RequestParam(defaultValue = "0")
            @Min(
                    value = 0,
                    message =
                            "page는 0 이상이어야 합니다."
            )
            int page,

            @RequestParam(defaultValue = "20")
            @Min(
                    value = 1,
                    message =
                            "size는 1 이상이어야 합니다."
            )
            @Max(
                    value = 20,
                    message =
                            "size는 20 이하여야 합니다."
            )
            int size
    ) {
        return friendRequestService
                .getSentRequests(
                        page,
                        size
                );
    }
}
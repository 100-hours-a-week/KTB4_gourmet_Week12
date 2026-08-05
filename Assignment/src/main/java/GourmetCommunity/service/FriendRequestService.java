package GourmetCommunity.service;

import GourmetCommunity.auth.SecurityUtil;
import GourmetCommunity.domain.friend.FriendPairKey;
import GourmetCommunity.dto.friend.FriendRequestPageResponseDto;
import GourmetCommunity.dto.friend.FriendRequestResponseDto;
import GourmetCommunity.entity.FriendRequest;
import GourmetCommunity.entity.FriendRequestStatus;
import GourmetCommunity.entity.Friendship;
import GourmetCommunity.event.FriendRequestAcceptedEvent;
import GourmetCommunity.event.FriendRequestCanceledEvent;
import GourmetCommunity.event.FriendRequestCreatedEvent;
import GourmetCommunity.event.FriendRequestRejectedEvent;
import GourmetCommunity.exception.ForbiddenException;
import GourmetCommunity.exception.FriendRequestConflictException;
import GourmetCommunity.exception.FriendRequestNotFoundException;
import GourmetCommunity.repository.FriendRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FriendRequestService {

    private static final int
            MAX_PAGE_SIZE = 20;

    private final FriendRequestRepository
            friendRequestRepository;

    private final FriendUserPairLockService
            friendUserPairLockService;

    private final FriendshipService
            friendshipService;

    private final ApplicationEventPublisher
            eventPublisher;

    @Transactional
    public FriendRequestResponseDto sendRequest(
            Long receiverId
    ) {
        Long senderId =
                SecurityUtil.getLoginUserId();

        if (senderId.equals(receiverId)) {
            throw new FriendRequestConflictException(
                    "자기 자신에게 친구 요청을 보낼 수 없습니다."
            );
        }

        FriendUserPairLockService
                .LockedFriendUsers lockedUsers =
                friendUserPairLockService
                        .lockUsers(
                                senderId,
                                receiverId
                        );

        String pairKey =
                FriendPairKey.of(
                        senderId,
                        receiverId
                );

        if (
                friendshipService
                        .existsByPairKey(pairKey)
        ) {
            throw new FriendRequestConflictException(
                    "이미 친구 관계인 사용자입니다."
            );
        }

        FriendRequest request =
                friendRequestRepository
                        .findByPairKey(pairKey)
                        .map(existing ->
                                prepareExistingRequest(
                                        existing,
                                        lockedUsers
                                )
                        )
                        .orElseGet(() ->
                                new FriendRequest(
                                        lockedUsers
                                                .sender(),
                                        lockedUsers
                                                .receiver()
                                )
                        );

        FriendRequest savedRequest =
                friendRequestRepository
                        .saveAndFlush(request);

        eventPublisher.publishEvent(
                new FriendRequestCreatedEvent(
                        savedRequest.getId(),
                        savedRequest.getSenderId(),
                        savedRequest.getReceiverId()
                )
        );

        return new FriendRequestResponseDto(
                savedRequest
        );
    }

    @Transactional
    public FriendRequestResponseDto acceptRequest(
            Long requestId
    ) {
        Long loginUserId =
                SecurityUtil.getLoginUserId();

        FriendRequest request =
                findRequestForUpdate(
                        requestId
                );

        validateReceiver(
                request,
                loginUserId
        );

        request.accept();

        Friendship friendship =
                friendshipService
                        .createFriendship(
                                request.getSender(),
                                request.getReceiver()
                        );

        eventPublisher.publishEvent(
                new FriendRequestAcceptedEvent(
                        request.getId(),
                        friendship.getId(),
                        request.getSenderId(),
                        request.getReceiverId()
                )
        );

        return new FriendRequestResponseDto(
                request
        );
    }

    @Transactional
    public FriendRequestResponseDto rejectRequest(
            Long requestId
    ) {
        Long loginUserId =
                SecurityUtil.getLoginUserId();

        FriendRequest request =
                findRequestForUpdate(
                        requestId
                );

        validateReceiver(
                request,
                loginUserId
        );

        request.reject();

        eventPublisher.publishEvent(
                new FriendRequestRejectedEvent(
                        request.getId(),
                        request.getSenderId(),
                        request.getReceiverId()
                )
        );

        return new FriendRequestResponseDto(
                request
        );
    }

    @Transactional
    public FriendRequestResponseDto cancelRequest(
            Long requestId
    ) {
        Long loginUserId =
                SecurityUtil.getLoginUserId();

        FriendRequest request =
                findRequestForUpdate(
                        requestId
                );

        validateSender(
                request,
                loginUserId
        );

        request.cancel();

        eventPublisher.publishEvent(
                new FriendRequestCanceledEvent(
                        request.getId(),
                        request.getSenderId(),
                        request.getReceiverId()
                )
        );

        return new FriendRequestResponseDto(
                request
        );
    }

    public FriendRequestPageResponseDto
    getReceivedRequests(
            int page,
            int size
    ) {
        Long receiverId =
                SecurityUtil.getLoginUserId();

        Page<FriendRequest> requestPage =
                friendRequestRepository
                        .findByReceiver_IdAndStatusOrderByCreatedAtDesc(
                                receiverId,
                                FriendRequestStatus.PENDING,
                                createPageRequest(
                                        page,
                                        size
                                )
                        );

        return new FriendRequestPageResponseDto(
                requestPage
        );
    }

    public FriendRequestPageResponseDto
    getSentRequests(
            int page,
            int size
    ) {
        Long senderId =
                SecurityUtil.getLoginUserId();

        Page<FriendRequest> requestPage =
                friendRequestRepository
                        .findBySender_IdAndStatusOrderByCreatedAtDesc(
                                senderId,
                                FriendRequestStatus.PENDING,
                                createPageRequest(
                                        page,
                                        size
                                )
                        );

        return new FriendRequestPageResponseDto(
                requestPage
        );
    }

    private FriendRequest prepareExistingRequest(
            FriendRequest request,
            FriendUserPairLockService
                    .LockedFriendUsers lockedUsers
    ) {
        if (request.isPending()) {
            if (
                    request.getSenderId()
                            .equals(
                                    lockedUsers
                                            .sender()
                                            .getId()
                            )
            ) {
                throw new FriendRequestConflictException(
                        "이미 친구 요청을 보냈습니다."
                );
            }

            throw new FriendRequestConflictException(
                    "상대방이 보낸 친구 요청이 대기 중입니다."
            );
        }

        if (
                request.getStatus()
                        == FriendRequestStatus.ACCEPTED
        ) {
            throw new FriendRequestConflictException(
                    "이미 친구 관계가 처리된 사용자입니다."
            );
        }

        request.reopen(
                lockedUsers.sender(),
                lockedUsers.receiver()
        );

        return request;
    }

    private FriendRequest findRequestForUpdate(
            Long requestId
    ) {
        return friendRequestRepository
                .findByIdForUpdate(requestId)
                .orElseThrow(() ->
                        new FriendRequestNotFoundException(
                                "친구 요청을 찾을 수 없습니다."
                        )
                );
    }

    private void validateReceiver(
            FriendRequest request,
            Long loginUserId
    ) {
        if (
                !request.getReceiverId()
                        .equals(loginUserId)
        ) {
            throw new ForbiddenException(
                    "친구 요청을 처리할 권한이 없습니다."
            );
        }
    }

    private void validateSender(
            FriendRequest request,
            Long loginUserId
    ) {
        if (
                !request.getSenderId()
                        .equals(loginUserId)
        ) {
            throw new ForbiddenException(
                    "친구 요청을 취소할 권한이 없습니다."
            );
        }
    }

    private PageRequest createPageRequest(
            int page,
            int size
    ) {
        int safePage =
                Math.max(page, 0);

        int safeSize =
                Math.max(
                        1,
                        Math.min(
                                size,
                                MAX_PAGE_SIZE
                        )
                );

        return PageRequest.of(
                safePage,
                safeSize
        );
    }
}
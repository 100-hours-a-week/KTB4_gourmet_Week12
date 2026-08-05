package GourmetCommunity.service;

import GourmetCommunity.auth.SecurityUtil;
import GourmetCommunity.domain.friend.FriendPairKey;
import GourmetCommunity.dto.friend.FriendRelationStatus;
import GourmetCommunity.dto.friend.UserSearchPageResponseDto;
import GourmetCommunity.dto.friend.UserSearchResponseDto;
import GourmetCommunity.entity.FriendRequest;
import GourmetCommunity.entity.FriendRequestStatus;
import GourmetCommunity.entity.Friendship;
import GourmetCommunity.entity.User;
import GourmetCommunity.repository.FriendRequestRepository;
import GourmetCommunity.repository.FriendshipRepository;
import GourmetCommunity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserSearchService {

    private static final int
            MAX_SEARCH_PAGE_SIZE = 20;

    private final UserRepository
            userRepository;

    private final FriendRequestRepository
            friendRequestRepository;

    private final FriendshipRepository
            friendshipRepository;

    public UserSearchPageResponseDto
    searchUsers(
            String nickname,
            int page,
            int size
    ) {
        Long loginUserId =
                SecurityUtil.getLoginUserId();

        int safePage =
                Math.max(page, 0);

        int safeSize =
                Math.max(
                        1,
                        Math.min(
                                size,
                                MAX_SEARCH_PAGE_SIZE
                        )
                );

        String normalizedNickname =
                nickname.trim();

        Page<User> userPage =
                userRepository
                        .findByDeletedAtIsNullAndIdNotAndNicknameContainingIgnoreCase(
                                loginUserId,
                                normalizedNickname,
                                PageRequest.of(
                                        safePage,
                                        safeSize,
                                        Sort.by(
                                                Sort.Order.asc(
                                                        "nickname"
                                                ),
                                                Sort.Order.asc(
                                                        "id"
                                                )
                                        )
                                )
                        );

        if (userPage.isEmpty()) {
            return createEmptyResponse(
                    userPage
            );
        }

        Map<Long, String>
                pairKeyByUserId =
                createPairKeyMap(
                        loginUserId,
                        userPage.getContent()
                );

        Set<String> friendshipPairKeys =
                loadFriendshipPairKeys(
                        pairKeyByUserId
                                .values()
                );

        Map<String, FriendRequest>
                pendingRequestByPairKey =
                loadPendingRequests(
                        pairKeyByUserId
                                .values()
                );

        List<UserSearchResponseDto> content =
                userPage.getContent()
                        .stream()
                        .map(user ->
                                createSearchResponse(
                                        loginUserId,
                                        user,
                                        pairKeyByUserId
                                                .get(
                                                        user.getId()
                                                ),
                                        friendshipPairKeys,
                                        pendingRequestByPairKey
                                )
                        )
                        .toList();

        return new UserSearchPageResponseDto(
                content,
                userPage.getNumber(),
                userPage.getSize(),
                userPage.getTotalElements(),
                userPage.getTotalPages(),
                userPage.hasNext(),
                userPage.hasPrevious()
        );
    }

    private Map<Long, String> createPairKeyMap(
            Long loginUserId,
            List<User> users
    ) {
        Map<Long, String> result =
                new HashMap<>();

        for (User user : users) {
            result.put(
                    user.getId(),
                    FriendPairKey.of(
                            loginUserId,
                            user.getId()
                    )
            );
        }

        return result;
    }

    private Set<String> loadFriendshipPairKeys(
            Iterable<String> pairKeys
    ) {
        List<String> keyList =
                toList(pairKeys);

        if (keyList.isEmpty()) {
            return Set.of();
        }

        List<Friendship> friendships =
                friendshipRepository
                        .findAllByPairKeyIn(
                                keyList
                        );

        Set<String> result =
                new HashSet<>();

        for (Friendship friendship
                : friendships) {
            result.add(
                    friendship.getPairKey()
            );
        }

        return result;
    }

    private Map<String, FriendRequest>
    loadPendingRequests(
            Iterable<String> pairKeys
    ) {
        List<String> keyList =
                toList(pairKeys);

        if (keyList.isEmpty()) {
            return Map.of();
        }

        List<FriendRequest> requests =
                friendRequestRepository
                        .findAllByPairKeyInAndStatus(
                                keyList,
                                FriendRequestStatus.PENDING
                        );

        Map<String, FriendRequest> result =
                new HashMap<>();

        for (FriendRequest request
                : requests) {
            result.put(
                    request.getPairKey(),
                    request
            );
        }

        return result;
    }

    private UserSearchResponseDto
    createSearchResponse(
            Long loginUserId,
            User user,
            String pairKey,
            Set<String> friendshipPairKeys,
            Map<String, FriendRequest>
                    pendingRequestByPairKey
    ) {
        if (
                friendshipPairKeys
                        .contains(pairKey)
        ) {
            return new UserSearchResponseDto(
                    user,
                    FriendRelationStatus.FRIEND,
                    null
            );
        }

        FriendRequest pendingRequest =
                pendingRequestByPairKey
                        .get(pairKey);

        if (pendingRequest == null) {
            return new UserSearchResponseDto(
                    user,
                    FriendRelationStatus.NONE,
                    null
            );
        }

        FriendRelationStatus status =
                pendingRequest
                        .getSenderId()
                        .equals(loginUserId)
                        ? FriendRelationStatus
                        .REQUEST_SENT
                        : FriendRelationStatus
                        .REQUEST_RECEIVED;

        return new UserSearchResponseDto(
                user,
                status,
                pendingRequest.getId()
        );
    }

    private List<String> toList(
            Iterable<String> values
    ) {
        List<String> result =
                new java.util.ArrayList<>();

        values.forEach(result::add);

        return result;
    }

    private UserSearchPageResponseDto
    createEmptyResponse(
            Page<User> userPage
    ) {
        return new UserSearchPageResponseDto(
                List.of(),
                userPage.getNumber(),
                userPage.getSize(),
                userPage.getTotalElements(),
                userPage.getTotalPages(),
                userPage.hasNext(),
                userPage.hasPrevious()
        );
    }
}
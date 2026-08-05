package GourmetCommunity.service;

import GourmetCommunity.auth.SecurityUtil;
import GourmetCommunity.domain.friend.FriendPairKey;
import GourmetCommunity.dto.friend.FriendListItemResponseDto;
import GourmetCommunity.dto.friend.FriendPageResponseDto;
import GourmetCommunity.entity.Friendship;
import GourmetCommunity.entity.User;
import GourmetCommunity.exception.FriendRequestConflictException;
import GourmetCommunity.repository.FriendshipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FriendshipService {

    private static final int
            MAX_PAGE_SIZE = 50;

    private final FriendshipRepository
            friendshipRepository;

    public boolean existsByPairKey(
            String pairKey
    ) {
        return friendshipRepository
                .existsByPairKey(pairKey);
    }

    /*
     * 친구 요청 수락 트랜잭션 안에서만 호출한다.
     */
    @Transactional(
            propagation = Propagation.MANDATORY
    )
    public Friendship createFriendship(
            User firstUser,
            User secondUser
    ) {
        String pairKey =
                FriendPairKey.of(
                        firstUser.getId(),
                        secondUser.getId()
                );

        if (
                friendshipRepository
                        .existsByPairKey(pairKey)
        ) {
            throw new FriendRequestConflictException(
                    "이미 친구 관계인 사용자입니다."
            );
        }

        Friendship friendship =
                new Friendship(
                        firstUser,
                        secondUser
                );

        try {
            return friendshipRepository
                    .saveAndFlush(friendship);
        } catch (
                DataIntegrityViolationException exception
        ) {
            throw new FriendRequestConflictException(
                    "이미 친구 관계인 사용자입니다.",
                    exception
            );
        }
    }

    public FriendPageResponseDto getFriends(
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
                                MAX_PAGE_SIZE
                        )
                );

        Page<Friendship> friendshipPage =
                friendshipRepository
                        .findFriendPageByUserId(
                                loginUserId,
                                PageRequest.of(
                                        safePage,
                                        safeSize
                                )
                        );

        List<FriendListItemResponseDto> content =
                friendshipPage
                        .getContent()
                        .stream()
                        .map(friendship ->
                                new FriendListItemResponseDto(
                                        friendship,
                                        friendship.getOtherUser(
                                                loginUserId
                                        )
                                )
                        )
                        .toList();

        return new FriendPageResponseDto(
                content,
                friendshipPage.getNumber(),
                friendshipPage.getSize(),
                friendshipPage.getTotalElements(),
                friendshipPage.getTotalPages(),
                friendshipPage.hasNext(),
                friendshipPage.hasPrevious()
        );
    }
}
package GourmetCommunity.service;

import GourmetCommunity.entity.User;
import GourmetCommunity.exception.FriendRequestConflictException;
import GourmetCommunity.exception.UserNotFoundException;
import GourmetCommunity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FriendUserPairLockService {

    private final UserRepository
            userRepository;

    /**
     * 항상 작은 사용자 ID부터 잠근다.
     *
     * A-B 요청과 B-A 요청이 동시에 들어와도
     * 잠금 획득 순서가 같아 교착 가능성을 줄인다.
     */
    @Transactional(
            propagation = Propagation.MANDATORY
    )
    public LockedFriendUsers lockUsers(
            Long senderId,
            Long receiverId
    ) {
        if (senderId.equals(receiverId)) {
            throw new FriendRequestConflictException(
                    "자기 자신에게 친구 요청을 보낼 수 없습니다."
            );
        }

        long lowerId =
                Math.min(
                        senderId,
                        receiverId
                );

        long higherId =
                Math.max(
                        senderId,
                        receiverId
                );

        User lowerUser =
                findActiveUserForUpdate(
                        lowerId
                );

        User higherUser =
                findActiveUserForUpdate(
                        higherId
                );

        User sender =
                lowerUser.getId()
                        .equals(senderId)
                        ? lowerUser
                        : higherUser;

        User receiver =
                lowerUser.getId()
                        .equals(receiverId)
                        ? lowerUser
                        : higherUser;

        return new LockedFriendUsers(
                sender,
                receiver
        );
    }

    private User findActiveUserForUpdate(
            Long userId
    ) {
        User user =
                userRepository
                        .findByIdForUpdate(userId)
                        .orElseThrow(() ->
                                new UserNotFoundException(
                                        "회원을 찾을 수 없습니다."
                                )
                        );

        if (user.getDeletedAt() != null) {
            throw new UserNotFoundException(
                    "회원을 찾을 수 없습니다."
            );
        }

        return user;
    }

    public record LockedFriendUsers(
            User sender,
            User receiver
    ) {
    }
}
package GourmetCommunity.domain.friend;

import java.util.Objects;

public final class FriendPairKey {

    private FriendPairKey() {
    }

    public static String of(
            Long firstUserId,
            Long secondUserId
    ) {
        Objects.requireNonNull(
                firstUserId,
                "firstUserId must not be null"
        );

        Objects.requireNonNull(
                secondUserId,
                "secondUserId must not be null"
        );

        if (firstUserId.equals(secondUserId)) {
            throw new IllegalArgumentException(
                    "동일한 사용자는 친구 관계를 만들 수 없습니다."
            );
        }

        long lowerUserId =
                Math.min(
                        firstUserId,
                        secondUserId
                );

        long higherUserId =
                Math.max(
                        firstUserId,
                        secondUserId
                );

        return lowerUserId
                + ":"
                + higherUserId;
    }
}
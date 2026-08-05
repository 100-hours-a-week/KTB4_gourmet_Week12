package GourmetCommunity.dto.friend;

import GourmetCommunity.entity.Friendship;
import GourmetCommunity.entity.User;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class FriendListItemResponseDto {

    private final Long friendshipId;

    private final Long userId;
    private final String nickname;
    private final String profileImage;

    private final LocalDateTime
            friendsSince;

    public FriendListItemResponseDto(
            Friendship friendship,
            User friend
    ) {
        this.friendshipId =
                friendship.getId();

        this.userId =
                friend.getId();

        this.nickname =
                friend.getDeletedAt() == null
                        ? friend.getNickname()
                        : "탈퇴한 회원";

        this.profileImage =
                friend.getDeletedAt() == null
                        ? friend.getProfileImage()
                        : null;

        this.friendsSince =
                friendship.getCreatedAt();
    }
}
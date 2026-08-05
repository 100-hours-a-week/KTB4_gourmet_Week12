package GourmetCommunity.dto.friend;

import GourmetCommunity.entity.User;
import lombok.Getter;

@Getter
public class UserSearchResponseDto {

    private final Long userId;
    private final String nickname;
    private final String profileImage;

    private final FriendRelationStatus
            relationStatus;

    /*
     * PENDING 요청이 있을 때만 값이 존재한다.
     *
     * 다음 단계에서 받은 요청의
     * 수락·거절에 사용한다.
     */
    private final Long friendRequestId;

    public UserSearchResponseDto(
            User user,
            FriendRelationStatus relationStatus,
            Long friendRequestId
    ) {
        this.userId = user.getId();
        this.nickname = user.getNickname();
        this.profileImage =
                user.getProfileImage();
        this.relationStatus =
                relationStatus;
        this.friendRequestId =
                friendRequestId;
    }
}
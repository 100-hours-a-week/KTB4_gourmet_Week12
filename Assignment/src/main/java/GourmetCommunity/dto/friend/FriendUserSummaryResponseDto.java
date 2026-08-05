package GourmetCommunity.dto.friend;

import GourmetCommunity.entity.User;
import lombok.Getter;

@Getter
public class FriendUserSummaryResponseDto {

    private final Long userId;
    private final String nickname;
    private final String profileImage;

    public FriendUserSummaryResponseDto(
            User user
    ) {
        this.userId = user.getId();

        if (user.getDeletedAt() == null) {
            this.nickname =
                    user.getNickname();
            this.profileImage =
                    user.getProfileImage();
        } else {
            this.nickname =
                    "탈퇴한 회원";
            this.profileImage = null;
        }
    }
}
package GourmetCommunity.dto;

import GourmetCommunity.entity.User;
import lombok.Getter;

@Getter
public class UserListResponseDto {

    private final Long id;
    private final String nickname;
    private final String profileImage;

    public UserListResponseDto(User user) {
        this.id = user.getId();
        this.nickname = user.getNickname();
        this.profileImage = user.getDeletedAt() == null
                ? user.getProfileImage()
                : null;
    }
}
/*
package KTB4_gourmet_Week7.Assignment.dto;

import lombok.Getter;
import KTB4_gourmet_Week7.Assignment.entity.User;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserResponseDto {
    private Long id;
    private String email;
    private String nickname;

    public UserResponseDto(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.nickname = user.getNickname();
    }
}
*/

package GourmetCommunity.dto;

import GourmetCommunity.entity.User;
import lombok.Getter;

@Getter
public class UserResponseDto {

    private final Long id;
    private final String email;
    private final String nickname;
    private final String profileImage;

    public UserResponseDto(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.nickname = user.getNickname();
        this.profileImage = user.getDeletedAt() == null
                ? user.getProfileImage()
                : null;
    }
}

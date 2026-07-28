package GourmetCommunity.dto;

import GourmetCommunity.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponseDto {

    private UserResponseDto user;

    public static LoginResponseDto of(User user) {
        return new LoginResponseDto(
                new UserResponseDto(user)
        );
    }
}
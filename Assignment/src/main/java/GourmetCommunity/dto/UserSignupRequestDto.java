package GourmetCommunity.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserSignupRequestDto {

    @NotBlank(message = "email is required")
    @Email(message = "email format is invalid")
    @Size(max = 100, message = "email must be 100 characters or less")
    private String email;

    @NotBlank(message = "password is required")
    @Size(max = 255, message = "password must be 255 characters or less")
    private String password;

    @NotBlank(message = "nickname is required")
    @Size(max = 50, message = "nickname must be 50 characters or less")
    private String nickname;

    public UserSignupRequestDto(String email, String password, String nickname) {
        this.email = email;
        this.password = password;
        this.nickname = nickname;
    }
}
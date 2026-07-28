package GourmetCommunity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserUpdateRequestDto {

    @NotBlank(message = "nickname is required")
    @Size(max = 50, message = "nickname must be 50 characters or less")
    private String nickname;

    public UserUpdateRequestDto(String nickname) {
        this.nickname = nickname;
    }
}
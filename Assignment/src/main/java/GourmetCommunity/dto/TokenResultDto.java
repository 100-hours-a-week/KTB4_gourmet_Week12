package GourmetCommunity.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TokenResultDto {

    private String newAccessToken;

    private String newRefreshToken;
}
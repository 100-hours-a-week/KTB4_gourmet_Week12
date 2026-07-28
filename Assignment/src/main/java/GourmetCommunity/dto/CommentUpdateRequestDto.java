package GourmetCommunity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class CommentUpdateRequestDto {

    @NotBlank(message = "content is required")
    @Size(max = 65535, message = "content must be 65535 characters or less")
    private String content;
}
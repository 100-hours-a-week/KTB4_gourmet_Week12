package GourmetCommunity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PostUpdateRequestDto {

    @NotBlank(message = "title is required")
    @Size(max = 100, message = "title must be 100 characters or less")
    private String title;

    @NotBlank(message = "content is required")
    @Size(max = 65535, message = "content must be 65535 characters or less")
    private String content;

    public PostUpdateRequestDto(String title, String content) {
        this.title = title;
        this.content = content;
    }
}
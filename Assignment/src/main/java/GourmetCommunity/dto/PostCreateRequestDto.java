package GourmetCommunity.dto;

import GourmetCommunity.entity.BoardType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PostCreateRequestDto {

    @NotBlank(message = "title is required")
    @Size(max = 100, message = "title must be 100 characters or less")
    private String title;

    @NotBlank(message = "content is required")
    @Size(max = 65535, message = "content must be 65535 characters or less")
    private String content;

    @NotNull(message = "boardType is required")
    private BoardType boardType;

    public PostCreateRequestDto(
            String title,
            String content,
            BoardType boardType
    ) {
        this.title = title;
        this.content = content;
        this.boardType = boardType;
    }
}
package GourmetCommunity.dto;

import lombok.Getter;

@Getter
public class PopularPostResponseDto {

    private final int rank;
    private final PostResponseDto post;

    public PopularPostResponseDto(
            int rank,
            PostResponseDto post
    ) {
        this.rank = rank;
        this.post = post;
    }
}
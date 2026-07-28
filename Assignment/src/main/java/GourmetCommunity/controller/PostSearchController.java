package GourmetCommunity.controller;

import GourmetCommunity.dto.PostPageResponseDto;
import GourmetCommunity.entity.BoardType;
import GourmetCommunity.search.PostSortType;
import GourmetCommunity.search.SearchType;
import GourmetCommunity.service.PostSearchService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/posts")
public class PostSearchController {

    private final PostSearchService postSearchService;

    @GetMapping("/search")
    public PostPageResponseDto searchPosts(
            @RequestParam
            @NotBlank(message = "keyword is required")
            @Size(
                    max = 100,
                    message = "keyword must be 100 characters or less"
            )
            String keyword,

            @RequestParam(defaultValue = "ALL")
            SearchType searchType,

            @RequestParam(required = false)
            BoardType boardType,

            @RequestParam(defaultValue = "LATEST")
            PostSortType sortType,

            @RequestParam(defaultValue = "0")
            @Min(
                    value = 0,
                    message = "page must be 0 or greater"
            )
            int page,

            @RequestParam(defaultValue = "10")
            @Min(
                    value = 1,
                    message = "size must be 1 or greater"
            )
            @Max(
                    value = 100,
                    message = "size must be 100 or less"
            )
            int size
    ) {
        return postSearchService.searchPosts(
                keyword,
                searchType,
                boardType,
                sortType,
                page,
                size
        );
    }
}
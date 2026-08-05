package GourmetCommunity.controller;

import GourmetCommunity.dto.friend.FriendPageResponseDto;
import GourmetCommunity.dto.friend.UserSearchPageResponseDto;
import GourmetCommunity.service.FriendshipService;
import GourmetCommunity.service.UserSearchService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/friends")
@RequiredArgsConstructor
@Validated
public class FriendController {

    private final UserSearchService
            userSearchService;

    private final FriendshipService
            friendshipService;

    @GetMapping
    public FriendPageResponseDto getFriends(
            @RequestParam(defaultValue = "0")
            @Min(
                    value = 0,
                    message =
                            "page는 0 이상이어야 합니다."
            )
            int page,

            @RequestParam(defaultValue = "50")
            @Min(
                    value = 1,
                    message =
                            "size는 1 이상이어야 합니다."
            )
            @Max(
                    value = 50,
                    message =
                            "size는 50 이하여야 합니다."
            )
            int size
    ) {
        return friendshipService
                .getFriends(
                        page,
                        size
                );
    }

    @GetMapping("/search")
    public UserSearchPageResponseDto
    searchUsers(
            @RequestParam
            @NotBlank(
                    message =
                            "검색할 닉네임을 입력해주세요."
            )
            @Size(
                    min = 2,
                    max = 50,
                    message =
                            "닉네임은 2자 이상 50자 이하로 검색해주세요."
            )
            String nickname,

            @RequestParam(defaultValue = "0")
            @Min(
                    value = 0,
                    message =
                            "page는 0 이상이어야 합니다."
            )
            int page,

            @RequestParam(defaultValue = "20")
            @Min(
                    value = 1,
                    message =
                            "size는 1 이상이어야 합니다."
            )
            @Max(
                    value = 20,
                    message =
                            "size는 20 이하여야 합니다."
            )
            int size
    ) {
        return userSearchService
                .searchUsers(
                        nickname,
                        page,
                        size
                );
    }
}
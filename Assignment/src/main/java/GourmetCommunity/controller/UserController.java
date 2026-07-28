package GourmetCommunity.controller;

import GourmetCommunity.dto.LoginRequestDto;
import GourmetCommunity.dto.LoginResponseDto;
import GourmetCommunity.dto.LoginResultDto;
import GourmetCommunity.dto.TokenResultDto;
import GourmetCommunity.dto.UserPageResponseDto;
import GourmetCommunity.dto.UserPasswordUpdateRequestDto;
import GourmetCommunity.dto.UserResponseDto;
import GourmetCommunity.dto.UserSignupRequestDto;
import GourmetCommunity.dto.UserUpdateRequestDto;
import GourmetCommunity.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Validated
public class UserController {

    private static final String ACCESS_TOKEN_COOKIE_NAME = "accessToken";
    private static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

    private final UserService userService;

    @PostMapping(value = "/signup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponseDto signup(
            @RequestParam
            @NotBlank(message = "email is required")
            @Email(message = "email format is invalid")
            @Size(max = 100, message = "email must be 100 characters or less")
            String email,

            @RequestParam
            @NotBlank(message = "password is required")
            @Size(max = 255, message = "password must be 255 characters or less")
            String password,

            @RequestParam
            @NotBlank(message = "nickname is required")
            @Size(max = 50, message = "nickname must be 50 characters or less")
            String nickname,

            @RequestPart(required = false) MultipartFile profileImage
    ) {
        UserSignupRequestDto request = new UserSignupRequestDto(email, password, nickname);

        return userService.signup(request, profileImage);
    }

    @PostMapping("/login")
    public LoginResponseDto login(
            @Valid @RequestBody LoginRequestDto request,
            HttpServletResponse response
    ) {
        LoginResultDto result = userService.login(request);

        addCookie(response, createAccessTokenCookie(result.getAccessToken()));
        addCookie(response, createRefreshTokenCookie(result.getRefreshToken()));

        return result.getResponse();
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(
            @CookieValue(name = REFRESH_TOKEN_COOKIE_NAME, required = false) String refreshToken,
            HttpServletResponse response
    ) {
        userService.logout(refreshToken);

        addCookie(response, deleteAccessTokenCookie());
        addCookie(response, deleteRefreshTokenCookie());
    }

    @PostMapping("/token/refresh")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void refreshAccessToken(
            @CookieValue(name = REFRESH_TOKEN_COOKIE_NAME, required = false) String refreshToken,
            HttpServletResponse response
    ) {
        TokenResultDto result = userService.refreshAccessToken(refreshToken);

        addCookie(response, createAccessTokenCookie(result.getNewAccessToken()));
        addCookie(response, createRefreshTokenCookie(result.getNewRefreshToken()));
    }

    @GetMapping
    public UserPageResponseDto getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return userService.getUsers(page, size);
    }

    @GetMapping("/me")
    public UserResponseDto getLoginUser() {
        return userService.getLoginUser();
    }

    @GetMapping("/{userId}")
    public UserResponseDto getUser(@PathVariable Long userId) {
        return userService.getUser(userId);
    }

    @PatchMapping(value = "/{userId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UserResponseDto updateUser(
            @PathVariable Long userId,

            @RequestParam
            @NotBlank(message = "nickname is required")
            @Size(max = 50, message = "nickname must be 50 characters or less")
            String nickname,

            @RequestPart(required = false) MultipartFile profileImage
    ) {
        UserUpdateRequestDto request = new UserUpdateRequestDto(nickname);

        return userService.updateUser(userId, request, profileImage);
    }

    @PatchMapping("/{userId}/password")
    public UserResponseDto updatePassword(
            @PathVariable Long userId,
            @Valid
            @RequestBody
            UserPasswordUpdateRequestDto request,
            HttpServletResponse response
    ) {
        UserResponseDto result =
                userService.updatePassword(
                        userId,
                        request
                );

        addCookie(
                response,
                deleteAccessTokenCookie()
        );

        addCookie(
                response,
                deleteRefreshTokenCookie()
        );

        return result;
    }

    @DeleteMapping("/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(
            @PathVariable Long userId,
            HttpServletResponse response
    ) {
        userService.deleteUser(userId);

        addCookie(
                response,
                deleteAccessTokenCookie()
        );

        addCookie(
                response,
                deleteRefreshTokenCookie()
        );
    }

    private ResponseCookie createAccessTokenCookie(String accessToken) {
        return ResponseCookie
                .from(ACCESS_TOKEN_COOKIE_NAME, accessToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(30 * 60)
                .sameSite("Lax")
                .build();
    }

    private ResponseCookie createRefreshTokenCookie(String refreshToken) {
        return ResponseCookie
                .from(REFRESH_TOKEN_COOKIE_NAME, refreshToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(14 * 24 * 60 * 60)
                .sameSite("Lax")
                .build();
    }

    private ResponseCookie deleteAccessTokenCookie() {
        return ResponseCookie
                .from(ACCESS_TOKEN_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
    }

    private ResponseCookie deleteRefreshTokenCookie() {
        return ResponseCookie
                .from(REFRESH_TOKEN_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
    }

    private void addCookie(HttpServletResponse response, ResponseCookie cookie) {
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
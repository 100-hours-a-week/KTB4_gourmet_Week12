package GourmetCommunity.controller;

import GourmetCommunity.auth.JwtProvider;
import GourmetCommunity.config.SecurityConfig;
import GourmetCommunity.dto.LoginRequestDto;
import GourmetCommunity.dto.UserSignupRequestDto;
import GourmetCommunity.dto.UserUpdateRequestDto;
import GourmetCommunity.exception.DuplicateEmailException;
import GourmetCommunity.exception.ForbiddenException;
import GourmetCommunity.exception.InvalidLoginException;
import GourmetCommunity.repository.UserRepository;
import GourmetCommunity.service.UserService;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Disabled("WebMvcTest 설정 보완 후 다시 진행")
@WebMvcTest(UserController.class)
@Import(SecurityConfig.class)
@DisplayName("UserController 인증·인가 HTTP 테스트")
class UserControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    /*
     * 실제 JwtAuthenticationFilter를 테스트 Context에 등록하기 위해
     * 필터가 의존하는 Bean을 Mock으로 제공한다.
     */
    @MockitoBean
    private JwtProvider jwtProvider;

    @MockitoBean
    private UserRepository userRepository;

    @Test
    @DisplayName("인증하지 않은 사용자가 회원정보를 수정하면 401을 반환한다")
    void update_user_returns_401_when_unauthenticated() throws Exception {
        mockMvc.perform(
                        multipart("/users/{userId}", 1L)
                                .with(request -> {
                                    request.setMethod("PATCH");
                                    return request;
                                })
                                .param("nickname", "changedNickname")
                )
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("인증이 필요합니다."))
                .andExpect(jsonPath("$.error").value("UNAUTHORIZED"));

        verifyNoInteractions(userService);
    }

    @Test
    @DisplayName("로그인한 사용자가 다른 회원정보를 수정하면 403을 반환한다")
    void update_user_returns_403_when_not_owner() throws Exception {
        // given
        doThrow(new ForbiddenException("접근 권한이 없습니다."))
                .when(userService)
                .updateUser(
                        eq(1L),
                        any(UserUpdateRequestDto.class),
                        isNull()
                );

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        2L,
                        null,
                        List.of()
                );

        // when & then
        mockMvc.perform(
                        multipart("/users/{userId}", 1L)
                                .with(request -> {
                                    request.setMethod("PATCH");
                                    return request;
                                })
                                .with(authentication(authentication))
                                .param("nickname", "changedNickname")
                )
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("접근 권한이 없습니다."))
                .andExpect(jsonPath("$.error").value("FORBIDDEN"));
    }

    @Test
    @DisplayName("중복된 이메일로 회원가입하면 409를 반환한다")
    void signup_returns_409_when_email_is_duplicated() throws Exception {
        // given
        doThrow(new DuplicateEmailException("이미 사용 중인 이메일입니다."))
                .when(userService)
                .signup(
                        any(UserSignupRequestDto.class),
                        isNull()
                );

        // when & then
        mockMvc.perform(
                        multipart("/users/signup")
                                .param("email", "duplicate@test.com")
                                .param("password", "Test1234!")
                                .param("nickname", "tester")
                )
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message")
                        .value("이미 사용 중인 이메일입니다."))
                .andExpect(jsonPath("$.error").value("CONFLICT"));
    }

    @Test
    @DisplayName("비밀번호가 일치하지 않으면 로그인 요청에 401을 반환한다")
    void login_returns_401_when_password_is_wrong() throws Exception {
        // given
        when(userService.login(any(LoginRequestDto.class)))
                .thenThrow(
                        new InvalidLoginException(
                                "이메일 또는 비밀번호가 일치하지 않습니다."
                        )
                );

        String requestBody = """
                {
                  "email": "test@test.com",
                  "password": "Wrong1234!"
                }
                """;

        // when & then
        mockMvc.perform(
                        post("/users/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message")
                        .value("이메일 또는 비밀번호가 일치하지 않습니다."))
                .andExpect(jsonPath("$.error").value("UNAUTHORIZED"));
    }
}
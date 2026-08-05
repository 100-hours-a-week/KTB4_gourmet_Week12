package GourmetCommunity.service;

import GourmetCommunity.auth.JwtProvider;
import GourmetCommunity.domain.user.DeletedUserIdentityGenerator;
import GourmetCommunity.domain.user.UserIdentityPolicy;
import GourmetCommunity.dto.LoginRequestDto;
import GourmetCommunity.dto.UserPasswordUpdateRequestDto;
import GourmetCommunity.dto.UserSignupRequestDto;
import GourmetCommunity.entity.User;
import GourmetCommunity.exception.DuplicateEmailException;
import GourmetCommunity.exception.DuplicateNicknameException;
import GourmetCommunity.exception.ForbiddenException;
import GourmetCommunity.exception.InvalidLoginException;
import GourmetCommunity.repository.RefreshTokenRepository;
import GourmetCommunity.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService 단위 테스트")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository
            refreshTokenRepository;

    @Mock
    private FileStorageService
            fileStorageService;

    @Mock
    private JwtProvider jwtProvider;

    @Mock
    private DeletedUserIdentityGenerator
            deletedUserIdentityGenerator;

    @Mock
    private UserIdentityPolicy
            userIdentityPolicy;

    private PasswordEncoder passwordEncoder;

    private UserService userService;

    @BeforeEach
    void setUp() {
        passwordEncoder =
                new BCryptPasswordEncoder();

        userService =
                new UserService(
                        userRepository,
                        refreshTokenRepository,
                        fileStorageService,
                        jwtProvider,
                        passwordEncoder,
                        deletedUserIdentityGenerator,
                        userIdentityPolicy
                );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder
                .clearContext();
    }

    @Test
    @DisplayName(
            "회원가입 시 비밀번호는 원문이 아닌 BCrypt 해시로 저장된다"
    )
    void signup_encodes_password() {
        // given
        UserSignupRequestDto request =
                org.mockito.Mockito.mock(
                        UserSignupRequestDto.class
                );

        when(request.getEmail())
                .thenReturn(
                        "test@test.com"
                );

        when(request.getPassword())
                .thenReturn(
                        "Test1234!"
                );

        when(request.getNickname())
                .thenReturn(
                        "tester"
                );

        when(
                userRepository.existsByEmail(
                        "test@test.com"
                )
        ).thenReturn(false);

        when(
                userRepository.existsByNickname(
                        "tester"
                )
        ).thenReturn(false);

        when(
                fileStorageService.saveFile(
                        null,
                        "profile"
                )
        ).thenReturn(null);

        when(
                userRepository.save(
                        any(User.class)
                )
        ).thenAnswer(
                invocation ->
                        invocation.getArgument(0)
        );

        // when
        userService.signup(
                request,
                null
        );

        // then
        ArgumentCaptor<User> userCaptor =
                ArgumentCaptor.forClass(
                        User.class
                );

        verify(userRepository)
                .save(
                        userCaptor.capture()
                );

        User savedUser =
                userCaptor.getValue();

        assertNotEquals(
                "Test1234!",
                savedUser.getPassword()
        );

        assertTrue(
                passwordEncoder.matches(
                        "Test1234!",
                        savedUser.getPassword()
                )
        );

        verify(userIdentityPolicy)
                .validateSignupIdentity(
                        "test@test.com",
                        "tester"
                );
    }

    @Test
    @DisplayName(
            "이미 존재하는 이메일로 회원가입하면 예외가 발생한다"
    )
    void signup_fails_when_email_is_duplicated() {
        // given
        UserSignupRequestDto request =
                org.mockito.Mockito.mock(
                        UserSignupRequestDto.class
                );

        when(request.getEmail())
                .thenReturn(
                        "duplicate@test.com"
                );

        when(request.getNickname())
                .thenReturn(
                        "tester"
                );

        when(
                userRepository.existsByEmail(
                        "duplicate@test.com"
                )
        ).thenReturn(true);

        // when
        DuplicateEmailException exception =
                assertThrows(
                        DuplicateEmailException.class,
                        () ->
                                userService.signup(
                                        request,
                                        null
                                )
                );

        // then
        assertEquals(
                "이미 사용 중인 이메일입니다.",
                exception.getMessage()
        );

        verify(userRepository, never())
                .existsByNickname(
                        any()
                );

        verify(userRepository, never())
                .save(
                        any(User.class)
                );

        verifyNoInteractions(
                fileStorageService
        );
    }

    @Test
    @DisplayName(
            "이미 존재하는 닉네임으로 회원가입하면 예외가 발생한다"
    )
    void signup_fails_when_nickname_is_duplicated() {
        // given
        UserSignupRequestDto request =
                org.mockito.Mockito.mock(
                        UserSignupRequestDto.class
                );

        when(request.getEmail())
                .thenReturn(
                        "test@test.com"
                );

        when(request.getNickname())
                .thenReturn(
                        "duplicateNickname"
                );

        when(
                userRepository.existsByEmail(
                        "test@test.com"
                )
        ).thenReturn(false);

        when(
                userRepository.existsByNickname(
                        "duplicateNickname"
                )
        ).thenReturn(true);

        // when
        DuplicateNicknameException exception =
                assertThrows(
                        DuplicateNicknameException.class,
                        () ->
                                userService.signup(
                                        request,
                                        null
                                )
                );

        // then
        assertEquals(
                "이미 사용 중인 닉네임입니다.",
                exception.getMessage()
        );

        verify(userRepository, never())
                .save(
                        any(User.class)
                );

        verifyNoInteractions(
                fileStorageService
        );
    }

    @Test
    @DisplayName(
            "비밀번호가 일치하지 않으면 로그인이 실패한다"
    )
    void login_fails_when_password_is_wrong() {
        // given
        String encodedPassword =
                passwordEncoder.encode(
                        "Correct1234!"
                );

        User user =
                new User(
                        "test@test.com",
                        encodedPassword,
                        "tester",
                        null
                );

        LoginRequestDto request =
                org.mockito.Mockito.mock(
                        LoginRequestDto.class
                );

        when(request.getEmail())
                .thenReturn(
                        "test@test.com"
                );

        when(request.getPassword())
                .thenReturn(
                        "Wrong1234!"
                );

        when(
                userRepository.findByEmail(
                        "test@test.com"
                )
        ).thenReturn(
                Optional.of(user)
        );

        // when
        InvalidLoginException exception =
                assertThrows(
                        InvalidLoginException.class,
                        () ->
                                userService.login(
                                        request
                                )
                );

        // then
        assertEquals(
                "이메일 또는 비밀번호가 일치하지 않습니다.",
                exception.getMessage()
        );

        verifyNoInteractions(
                jwtProvider
        );

        verifyNoInteractions(
                refreshTokenRepository
        );
    }

    @Test
    @DisplayName(
            "탈퇴한 회원은 올바른 비밀번호를 입력해도 로그인할 수 없다"
    )
    void login_fails_when_user_is_deleted() {
        // given
        User user =
                new User(
                        "test@test.com",
                        passwordEncoder.encode(
                                "Test1234!"
                        ),
                        "tester",
                        "/uploads/profile/test.png"
                );

        user.delete(
                "deleted_"
                        + "a".repeat(32)
                        + "@deleted.invalid",

                "__deleted__"
                        + "a".repeat(32),

                passwordEncoder.encode(
                        "deleted-password"
                )
        );

        LoginRequestDto request =
                org.mockito.Mockito.mock(
                        LoginRequestDto.class
                );

        when(request.getEmail())
                .thenReturn(
                        "test@test.com"
                );

        when(
                userRepository.findByEmail(
                        "test@test.com"
                )
        ).thenReturn(
                Optional.of(user)
        );

        // when
        InvalidLoginException exception =
                assertThrows(
                        InvalidLoginException.class,
                        () ->
                                userService.login(
                                        request
                                )
                );

        // then
        assertEquals(
                "이메일 또는 비밀번호가 일치하지 않습니다.",
                exception.getMessage()
        );

        verifyNoInteractions(
                jwtProvider
        );

        verifyNoInteractions(
                refreshTokenRepository
        );
    }

    @Test
    @DisplayName(
            "비밀번호 변경 시 새 비밀번호도 BCrypt 해시로 저장된다"
    )
    void update_password_encodes_new_password() {
        // given
        setLoginUser(1L);

        User user =
                new User(
                        "test@test.com",
                        passwordEncoder.encode(
                                "Old1234!"
                        ),
                        "tester",
                        null
                );

        UserPasswordUpdateRequestDto request =
                org.mockito.Mockito.mock(
                        UserPasswordUpdateRequestDto.class
                );

        when(request.getCurrentPassword())
                .thenReturn(
                        "Old1234!"
                );

        when(request.getNewPassword())
                .thenReturn(
                        "New1234!"
                );

        when(
                userRepository.findById(
                        1L
                )
        ).thenReturn(
                Optional.of(user)
        );

        when(
                refreshTokenRepository
                        .findByUserId(
                                1L
                        )
        ).thenReturn(
                Optional.empty()
        );

        // when
        userService.updatePassword(
                1L,
                request
        );

        // then
        assertNotEquals(
                "New1234!",
                user.getPassword()
        );

        assertTrue(
                passwordEncoder.matches(
                        "New1234!",
                        user.getPassword()
                )
        );

        verify(refreshTokenRepository)
                .findByUserId(
                        1L
                );
    }

    @Test
    @DisplayName(
            "다른 사용자의 비밀번호 변경을 요청하면 권한 예외가 발생한다"
    )
    void update_password_fails_when_user_is_not_owner() {
        // given
        setLoginUser(2L);

        UserPasswordUpdateRequestDto request =
                org.mockito.Mockito.mock(
                        UserPasswordUpdateRequestDto.class
                );

        // when
        assertThrows(
                ForbiddenException.class,
                () ->
                        userService.updatePassword(
                                1L,
                                request
                        )
        );

        // then
        verify(userRepository, never())
                .findById(
                        anyLong()
                );

        verifyNoInteractions(
                refreshTokenRepository
        );
    }

    private void setLoginUser(
            Long userId
    ) {
        UsernamePasswordAuthenticationToken
                authentication =
                new UsernamePasswordAuthenticationToken(
                        userId,
                        null,
                        List.of()
                );

        SecurityContextHolder
                .getContext()
                .setAuthentication(
                        authentication
                );
    }
}
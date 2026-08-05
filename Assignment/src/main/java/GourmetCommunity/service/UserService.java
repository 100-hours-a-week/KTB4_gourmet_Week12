package GourmetCommunity.service;

import GourmetCommunity.auth.JwtProvider;
import GourmetCommunity.auth.SecurityUtil;
import GourmetCommunity.domain.user.DeletedUserIdentity;
import GourmetCommunity.domain.user.DeletedUserIdentityGenerator;
import GourmetCommunity.domain.user.UserIdentityPolicy;
import GourmetCommunity.dto.*;
import GourmetCommunity.entity.RefreshToken;
import GourmetCommunity.entity.User;
import GourmetCommunity.exception.DuplicateEmailException;
import GourmetCommunity.exception.DuplicateNicknameException;
import GourmetCommunity.exception.InvalidLoginException;
import GourmetCommunity.exception.UserNotFoundException;
import GourmetCommunity.repository.RefreshTokenRepository;
import GourmetCommunity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private static final int
            DELETED_IDENTITY_GENERATION_LIMIT = 5;

    private final UserRepository
            userRepository;

    private final RefreshTokenRepository
            refreshTokenRepository;

    private final FileStorageService
            fileStorageService;

    private final JwtProvider
            jwtProvider;

    private final PasswordEncoder
            passwordEncoder;

    private final DeletedUserIdentityGenerator
            deletedUserIdentityGenerator;

    private final UserIdentityPolicy
            userIdentityPolicy;

    @Transactional
    public UserResponseDto signup(
            UserSignupRequestDto request,
            MultipartFile profileImage
    ) {
        userIdentityPolicy
                .validateSignupIdentity(
                        request.getEmail(),
                        request.getNickname()
                );

        if (
                userRepository.existsByEmail(
                        request.getEmail()
                )
        ) {
            throw new DuplicateEmailException(
                    "이미 사용 중인 이메일입니다."
            );
        }

        if (
                userRepository.existsByNickname(
                        request.getNickname()
                )
        ) {
            throw new DuplicateNicknameException(
                    "이미 사용 중인 닉네임입니다."
            );
        }

        String profileImageUrl =
                fileStorageService.saveFile(
                        profileImage,
                        "profile"
                );

        String encodedPassword =
                passwordEncoder.encode(
                        request.getPassword()
                );

        User user =
                new User(
                        request.getEmail(),
                        encodedPassword,
                        request.getNickname(),
                        profileImageUrl
                );

        User savedUser =
                userRepository.save(user);

        return new UserResponseDto(
                savedUser
        );
    }

    @Transactional
    public LoginResultDto login(
            LoginRequestDto request
    ) {
        User user =
                userRepository
                        .findByEmail(
                                request.getEmail()
                        )
                        .orElseThrow(() ->
                                new InvalidLoginException(
                                        "이메일 또는 비밀번호가 일치하지 않습니다."
                                )
                        );

        if (user.getDeletedAt() != null) {
            throw new InvalidLoginException(
                    "이메일 또는 비밀번호가 일치하지 않습니다."
            );
        }

        if (
                !passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                )
        ) {
            throw new InvalidLoginException(
                    "이메일 또는 비밀번호가 일치하지 않습니다."
            );
        }

        String accessToken =
                jwtProvider.createAccessToken(
                        user.getId(),
                        user.getEmail(),
                        user.getNickname()
                );

        String refreshToken =
                jwtProvider.createRefreshToken(
                        user.getId()
                );

        refreshTokenRepository
                .findByUserId(user.getId())
                .ifPresentOrElse(
                        savedRefreshToken ->
                                savedRefreshToken
                                        .updateToken(
                                                refreshToken,
                                                jwtProvider
                                                        .getRefreshTokenExpiresAt()
                                        ),

                        () ->
                                refreshTokenRepository
                                        .save(
                                                new RefreshToken(
                                                        refreshToken,
                                                        user.getId(),
                                                        jwtProvider
                                                                .getRefreshTokenExpiresAt()
                                                )
                                        )
                );

        LoginResponseDto response =
                LoginResponseDto.of(user);

        return new LoginResultDto(
                response,
                accessToken,
                refreshToken
        );
    }

    @Transactional
    public TokenResultDto refreshAccessToken(
            String refreshToken
    ) {
        if (
                refreshToken == null
                        || refreshToken.isBlank()
        ) {
            throw new InvalidLoginException(
                    "인증 정보가 유효하지 않습니다."
            );
        }

        try {
            jwtProvider.parse(refreshToken);

            if (
                    !jwtProvider.isRefreshToken(
                            refreshToken
                    )
            ) {
                throw new InvalidLoginException(
                        "인증 정보가 유효하지 않습니다."
                );
            }
        } catch (Exception exception) {
            throw new InvalidLoginException(
                    "인증 정보가 유효하지 않습니다."
            );
        }

        RefreshToken savedRefreshToken =
                refreshTokenRepository
                        .findByToken(refreshToken)
                        .orElseThrow(() ->
                                new InvalidLoginException(
                                        "인증 정보가 유효하지 않습니다."
                                )
                        );

        if (savedRefreshToken.isExpired()) {
            refreshTokenRepository
                    .delete(savedRefreshToken);

            throw new InvalidLoginException(
                    "인증 정보가 유효하지 않습니다."
            );
        }

        User user =
                userRepository
                        .findById(
                                savedRefreshToken
                                        .getUserId()
                        )
                        .orElseThrow(() ->
                                new InvalidLoginException(
                                        "인증 정보가 유효하지 않습니다."
                                )
                        );

        if (user.getDeletedAt() != null) {
            refreshTokenRepository
                    .delete(savedRefreshToken);

            throw new InvalidLoginException(
                    "인증 정보가 유효하지 않습니다."
            );
        }

        String newAccessToken =
                jwtProvider.createAccessToken(
                        user.getId(),
                        user.getEmail(),
                        user.getNickname()
                );

        String newRefreshToken =
                jwtProvider.createRefreshToken(
                        user.getId()
                );

        savedRefreshToken.updateToken(
                newRefreshToken,
                jwtProvider
                        .getRefreshTokenExpiresAt()
        );

        return new TokenResultDto(
                newAccessToken,
                newRefreshToken
        );
    }

    @Transactional
    public void logout(
            String refreshToken
    ) {
        if (
                refreshToken == null
                        || refreshToken.isBlank()
        ) {
            return;
        }

        refreshTokenRepository
                .findByToken(refreshToken)
                .ifPresent(
                        refreshTokenRepository::delete
                );
    }

    public UserPageResponseDto getUsers(
            int page,
            int size
    ) {
        Page<User> userPage =
                userRepository.findAll(
                        PageRequest.of(
                                page,
                                size,
                                Sort.by(
                                        Sort.Direction.ASC,
                                        "id"
                                )
                        )
                );

        List<UserListResponseDto> content =
                userPage.getContent()
                        .stream()
                        .map(
                                UserListResponseDto::new
                        )
                        .toList();

        return new UserPageResponseDto(
                content,
                userPage.getNumber(),
                userPage.getSize(),
                userPage.getTotalElements(),
                userPage.getTotalPages(),
                userPage.hasNext(),
                userPage.hasPrevious()
        );
    }

    public UserResponseDto getLoginUser() {
        Long loginUserId =
                SecurityUtil.getLoginUserId();

        User user =
                findUserById(loginUserId);

        return new UserResponseDto(user);
    }

    public UserResponseDto getUser(
            Long userId
    ) {
        User user =
                findUserById(userId);

        return new UserResponseDto(user);
    }

    @Transactional
    public UserResponseDto updateUser(
            Long userId,
            UserUpdateRequestDto request,
            MultipartFile profileImage
    ) {
        SecurityUtil.validateLoginUser(
                userId
        );

        userIdentityPolicy
                .validateNickname(
                        request.getNickname()
                );

        User user =
                findUserById(userId);

        if (
                userRepository
                        .existsByNicknameAndIdNot(
                                request.getNickname(),
                                userId
                        )
        ) {
            throw new DuplicateNicknameException(
                    "이미 사용 중인 닉네임입니다."
            );
        }

        user.update(
                request.getNickname()
        );

        String profileImageUrl =
                fileStorageService.saveFile(
                        profileImage,
                        "profile"
                );

        if (profileImageUrl != null) {
            user.updateProfileImage(
                    profileImageUrl
            );
        }

        return new UserResponseDto(user);
    }

    @Transactional
    public UserResponseDto updatePassword(
            Long userId,
            UserPasswordUpdateRequestDto request
    ) {
        SecurityUtil.validateLoginUser(
                userId
        );

        User user =
                findUserById(userId);

        if (
                !passwordEncoder.matches(
                        request.getCurrentPassword(),
                        user.getPassword()
                )
        ) {
            throw new InvalidLoginException(
                    "현재 비밀번호가 일치하지 않습니다."
            );
        }

        String encodedPassword =
                passwordEncoder.encode(
                        request.getNewPassword()
                );

        user.updatePassword(
                encodedPassword
        );

        refreshTokenRepository
                .findByUserId(userId)
                .ifPresent(
                        refreshTokenRepository::delete
                );

        return new UserResponseDto(user);
    }

    @Transactional
    public void deleteUser(
            Long userId
    ) {
        SecurityUtil.validateLoginUser(
                userId
        );

        /*
         * 동일 계정에 탈퇴 요청이 동시에 들어와도
         * 한 요청씩 처리하도록 사용자 행을 잠근다.
         */
        User user =
                userRepository
                        .findByIdForUpdate(userId)
                        .orElseThrow(() ->
                                new UserNotFoundException(
                                        "회원을 찾을 수 없습니다."
                                )
                        );

        if (user.getDeletedAt() != null) {
            throw new UserNotFoundException(
                    "회원을 찾을 수 없습니다."
            );
        }

        DeletedUserIdentity identity =
                generateUniqueDeletedIdentity();

        /*
         * 탈퇴 회원의 비밀번호도 기존 비밀번호 컬럼과
         * 동일하게 BCrypt 형식을 유지한다.
         */
        String deletedPassword =
                passwordEncoder.encode(
                        UUID.randomUUID()
                                .toString()
                );

        refreshTokenRepository
                .findByUserId(userId)
                .ifPresent(
                        refreshTokenRepository::delete
                );

        user.delete(
                identity.email(),
                identity.nickname(),
                deletedPassword
        );

        /*
         * UNIQUE 제약 및 컬럼 길이 오류를
         * 트랜잭션 종료 전에 확인한다.
         */
        userRepository.flush();
    }

    private DeletedUserIdentity
    generateUniqueDeletedIdentity() {
        for (
                int attempt = 0;
                attempt
                        < DELETED_IDENTITY_GENERATION_LIMIT;
                attempt++
        ) {
            DeletedUserIdentity identity =
                    deletedUserIdentityGenerator
                            .generate();

            boolean emailExists =
                    userRepository.existsByEmail(
                            identity.email()
                    );

            boolean nicknameExists =
                    userRepository.existsByNickname(
                            identity.nickname()
                    );

            if (
                    !emailExists
                            && !nicknameExists
            ) {
                return identity;
            }
        }

        throw new IllegalStateException(
                "탈퇴 회원 식별값을 생성하지 못했습니다."
        );
    }

    private User findUserById(
            Long userId
    ) {
        return userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "회원을 찾을 수 없습니다."
                        )
                );
    }
}
package GourmetCommunity.service;

import GourmetCommunity.auth.JwtProvider;
import GourmetCommunity.dto.*;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import GourmetCommunity.auth.SecurityUtil;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final FileStorageService fileStorageService;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponseDto signup(UserSignupRequestDto request, MultipartFile profileImage) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("이미 사용 중인 이메일입니다.");
        }

        if (userRepository.existsByNickname(request.getNickname())) {
            throw new DuplicateNicknameException("이미 사용 중인 닉네임입니다.");
        }

        String profileImageUrl = fileStorageService.saveFile(profileImage, "profile");

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User(
                request.getEmail(),
                encodedPassword,
                request.getNickname(),
                profileImageUrl
        );

        User savedUser = userRepository.save(user);

        return new UserResponseDto(savedUser);
    }

    @Transactional
    public LoginResultDto login(LoginRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidLoginException("이메일 또는 비밀번호가 일치하지 않습니다."));

        if (user.getDeletedAt() != null) {
            throw new InvalidLoginException("이메일 또는 비밀번호가 일치하지 않습니다.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidLoginException("이메일 또는 비밀번호가 일치하지 않습니다.");
        }

        String accessToken = jwtProvider.createAccessToken(
                user.getId(),
                user.getEmail(),
                user.getNickname()
        );

        String refreshToken = jwtProvider.createRefreshToken(user.getId());

        refreshTokenRepository.findByUserId(user.getId())
                .ifPresentOrElse(
                        savedRefreshToken -> savedRefreshToken.updateToken(
                                refreshToken,
                                jwtProvider.getRefreshTokenExpiresAt()
                        ),
                        () -> refreshTokenRepository.save(
                                new RefreshToken(
                                        refreshToken,
                                        user.getId(),
                                        jwtProvider.getRefreshTokenExpiresAt()
                                )
                        )
                );

        LoginResponseDto response = LoginResponseDto.of(user);

        return new LoginResultDto(response, accessToken, refreshToken);
    }

    @Transactional
    public TokenResultDto refreshAccessToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new InvalidLoginException("인증 정보가 유효하지 않습니다.");
        }

        try {
            jwtProvider.parse(refreshToken);

            if (!jwtProvider.isRefreshToken(refreshToken)) {
                throw new InvalidLoginException("인증 정보가 유효하지 않습니다.");
            }
        } catch (Exception e) {
            throw new InvalidLoginException("인증 정보가 유효하지 않습니다.");
        }

        RefreshToken savedRefreshToken = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new InvalidLoginException("인증 정보가 유효하지 않습니다."));

        if (savedRefreshToken.isExpired()) {
            refreshTokenRepository.delete(savedRefreshToken);
            throw new InvalidLoginException("인증 정보가 유효하지 않습니다.");
        }

        User user = userRepository.findById(savedRefreshToken.getUserId())
                .orElseThrow(() -> new InvalidLoginException("인증 정보가 유효하지 않습니다."));

        if (user.getDeletedAt() != null) {
            refreshTokenRepository.delete(savedRefreshToken);
            throw new InvalidLoginException("인증 정보가 유효하지 않습니다.");
        }

        String newAccessToken = jwtProvider.createAccessToken(
                user.getId(),
                user.getEmail(),
                user.getNickname()
        );

        String newRefreshToken = jwtProvider.createRefreshToken(user.getId());

        savedRefreshToken.updateToken(
                newRefreshToken,
                jwtProvider.getRefreshTokenExpiresAt()
        );

        return new TokenResultDto(newAccessToken, newRefreshToken);
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }

        refreshTokenRepository.findByToken(refreshToken)
                .ifPresent(refreshTokenRepository::delete);
    }

    public UserPageResponseDto getUsers(int page, int size) {
        Page<User> userPage = userRepository.findAll(
                PageRequest.of(
                        page,
                        size,
                        Sort.by(Sort.Direction.ASC, "id")
                )
        );

        List<UserListResponseDto> content = userPage.getContent()
                .stream()
                .map(UserListResponseDto::new)
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

    public UserResponseDto getUser(Long userId) {
        User user = findUserById(userId);

        return new UserResponseDto(user);
    }

    @Transactional
    public UserResponseDto updateUser(Long userId, UserUpdateRequestDto request, MultipartFile profileImage) {
        SecurityUtil.validateLoginUser(userId);

        User user = findUserById(userId);

        if (userRepository.existsByNicknameAndIdNot(request.getNickname(), userId)) {
            throw new DuplicateNicknameException("이미 사용 중인 닉네임입니다.");
        }

        user.update(request.getNickname());

        String profileImageUrl = fileStorageService.saveFile(profileImage, "profile");

        if (profileImageUrl != null) {
            user.updateProfileImage(profileImageUrl);
        }

        return new UserResponseDto(user);
    }

    @Transactional
    public UserResponseDto updatePassword(
            Long userId,
            UserPasswordUpdateRequestDto request
    ) {
        SecurityUtil.validateLoginUser(userId);

        User user = findUserById(userId);

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword()
        )) {
            throw new InvalidLoginException(
                    "현재 비밀번호가 일치하지 않습니다."
            );
        }

        String encodedPassword =
                passwordEncoder.encode(
                        request.getNewPassword()
                );

        user.updatePassword(encodedPassword);

        refreshTokenRepository
                .findByUserId(userId)
                .ifPresent(
                        refreshTokenRepository::delete
                );

        return new UserResponseDto(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        SecurityUtil.validateLoginUser(userId);

        User user = findUserById(userId);

        refreshTokenRepository
                .findByUserId(userId)
                .ifPresent(
                        refreshTokenRepository::delete
                );

        user.delete();
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("회원을 찾을 수 없습니다."));
    }
}
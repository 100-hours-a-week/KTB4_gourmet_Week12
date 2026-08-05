package GourmetCommunity.user;

import GourmetCommunity.entity.User;
import GourmetCommunity.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
@DisplayName("회원 탈퇴 JPA 테스트")
class UserDeleteJpaTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager entityManager;

    private final PasswordEncoder
            passwordEncoder =
            new BCryptPasswordEncoder();

    @Test
    @DisplayName(
            "회원 탈퇴 시 개인정보가 익명화되고 DB에 저장된다"
    )
    void delete_user_anonymizes_personal_information() {
        // given
        String originalEmail =
                "test@test.com";

        String originalPassword =
                passwordEncoder.encode(
                        "Original1234!"
                );

        String originalNickname =
                "tester";

        String originalProfileImage =
                "/uploads/profile/test.png";

        User user =
                new User(
                        originalEmail,
                        originalPassword,
                        originalNickname,
                        originalProfileImage
                );

        User savedUser =
                userRepository.saveAndFlush(
                        user
                );

        Long savedUserId =
                savedUser.getId();

        String randomValue =
                UUID.randomUUID()
                        .toString()
                        .replace(
                                "-",
                                ""
                        );

        String deletedEmail =
                "deleted_"
                        + randomValue
                        + "@deleted.invalid";

        String deletedNickname =
                "__deleted__"
                        + randomValue;

        String deletedRawPassword =
                UUID.randomUUID()
                        .toString();

        String deletedPassword =
                passwordEncoder.encode(
                        deletedRawPassword
                );

        // when
        savedUser.delete(
                deletedEmail,
                deletedNickname,
                deletedPassword
        );

        userRepository.flush();

        /*
         * 영속성 Context의 기존 Entity가 아니라
         * DB에 저장된 값을 다시 조회하기 위해 초기화한다.
         */
        entityManager.clear();

        User reloadedUser =
                userRepository
                        .findById(
                                savedUserId
                        )
                        .orElseThrow();

        // then
        assertAll(
                () -> assertNotNull(
                        savedUserId
                ),

                () -> assertNotNull(
                        reloadedUser.getDeletedAt()
                ),

                () -> assertNotEquals(
                        originalEmail,
                        reloadedUser.getEmail()
                ),

                () -> assertEquals(
                        deletedEmail,
                        reloadedUser.getEmail()
                ),

                () -> assertTrue(
                        reloadedUser
                                .getEmail()
                                .matches(
                                        "^deleted_[0-9a-f]{32}"
                                                + "@deleted\\.invalid$"
                                )
                ),

                () -> assertNotEquals(
                        originalNickname,
                        reloadedUser.getNickname()
                ),

                () -> assertEquals(
                        deletedNickname,
                        reloadedUser.getNickname()
                ),

                () -> assertTrue(
                        reloadedUser
                                .getNickname()
                                .matches(
                                        "^__deleted__[0-9a-f]{32}$"
                                )
                ),

                () -> assertNotEquals(
                        originalPassword,
                        reloadedUser.getPassword()
                ),

                () -> assertEquals(
                        deletedPassword,
                        reloadedUser.getPassword()
                ),

                () -> assertTrue(
                        passwordEncoder.matches(
                                deletedRawPassword,
                                reloadedUser.getPassword()
                        )
                ),

                () -> assertNull(
                        reloadedUser.getProfileImage()
                )
        );
    }
}
package GourmetCommunity.user;

import GourmetCommunity.entity.User;
import GourmetCommunity.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@DisplayName("회원 탈퇴 JPA 테스트")
class UserDeleteJpaTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("저장된 회원을 탈퇴시키면 id가 포함된 값으로 개인정보가 마스킹된다")
    void delete_user_masks_personal_information_with_id() {
        // given
        User user = new User(
                "test@test.com",
                "encoded-password",
                "tester",
                "/uploads/profile/test.png"
        );

        User savedUser = userRepository.saveAndFlush(user);
        Long savedUserId = savedUser.getId();

        // when
        savedUser.delete();
        userRepository.flush();

        // then
        assertAll(
                () -> assertNotNull(savedUserId),
                () -> assertNotNull(savedUser.getDeletedAt()),
                () -> assertEquals(
                        "deleted_user_" + savedUserId + "@deleted.local",
                        savedUser.getEmail()
                ),
                () -> assertEquals(
                        "탈퇴회원_" + savedUserId,
                        savedUser.getNickname()
                ),
                () -> assertEquals(
                        "DELETED_USER",
                        savedUser.getPassword()
                ),
                () -> assertNull(savedUser.getProfileImage())
        );
    }
}
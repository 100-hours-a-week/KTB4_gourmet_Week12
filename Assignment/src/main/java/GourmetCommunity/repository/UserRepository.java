package GourmetCommunity.repository;

import GourmetCommunity.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository
        extends JpaRepository<User, Long> {

    boolean existsByEmail(
            String email
    );

    boolean existsByNickname(
            String nickname
    );

    boolean existsByNicknameAndIdNot(
            String nickname,
            Long userId
    );

    Optional<User> findByEmail(
            String email
    );

    /*
     * 탈퇴 회원과 자기 자신을 제외한 뒤
     * 닉네임 일부 일치 검색을 수행한다.
     *
     * Containing 쿼리는 전달받은 검색 문자열을
     * LIKE 검색에 맞게 처리한다.
     */
    Page<User>
    findByDeletedAtIsNullAndIdNotAndNicknameContainingIgnoreCase(
            Long loginUserId,
            String nickname,
            Pageable pageable
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT user
            FROM User user
            WHERE user.id = :userId
            """)
    Optional<User> findByIdForUpdate(
            @Param("userId")
            Long userId
    );
}
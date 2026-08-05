package GourmetCommunity.repository;

import GourmetCommunity.entity.Friendship;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface FriendshipRepository
        extends JpaRepository<Friendship, Long> {

    Optional<Friendship> findByPairKey(
            String pairKey
    );

    boolean existsByPairKey(
            String pairKey
    );

    List<Friendship> findAllByPairKeyIn(
            Collection<String> pairKeys
    );

    /*
     * 로그인 사용자가 userA 또는 userB인 관계를 조회한다.
     *
     * 상대 사용자가 탈퇴했다면 현재 친구 목록에서는 제외한다.
     * userA, userB를 함께 조회해 DTO 변환 중 N+1을 방지한다.
     */
    @EntityGraph(
            attributePaths = {
                    "userA",
                    "userB"
            }
    )
    @Query(
            value = """
                    SELECT friendship
                    FROM Friendship friendship
                    WHERE (
                        friendship.userA.id = :userId
                        AND friendship.userB.deletedAt IS NULL
                    )
                    OR (
                        friendship.userB.id = :userId
                        AND friendship.userA.deletedAt IS NULL
                    )
                    ORDER BY
                        friendship.createdAt DESC,
                        friendship.id DESC
                    """,
            countQuery = """
                    SELECT COUNT(friendship)
                    FROM Friendship friendship
                    WHERE (
                        friendship.userA.id = :userId
                        AND friendship.userB.deletedAt IS NULL
                    )
                    OR (
                        friendship.userB.id = :userId
                        AND friendship.userA.deletedAt IS NULL
                    )
                    """
    )
    Page<Friendship> findFriendPageByUserId(
            @Param("userId")
            Long userId,
            Pageable pageable
    );
}
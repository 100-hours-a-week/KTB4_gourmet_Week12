package GourmetCommunity.repository;

import GourmetCommunity.entity.ChatRoom;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository
        extends JpaRepository<ChatRoom, Long> {

    @EntityGraph(
            attributePaths = {
                    "userA",
                    "userB"
            }
    )
    Optional<ChatRoom> findByPairKey(
            String pairKey
    );

    boolean existsByPairKey(
            String pairKey
    );

    @EntityGraph(
            attributePaths = {
                    "userA",
                    "userB"
            }
    )
    @Query("""
            SELECT chatRoom
            FROM ChatRoom chatRoom
            WHERE chatRoom.id = :roomId
            """)
    Optional<ChatRoom> findByIdWithUsers(
            @Param("roomId")
            Long roomId
    );

    /*
     * 로그인 사용자가 참여한 채팅방만 조회한다.
     * 상대 사용자가 탈퇴했다면 목록에서 제외한다.
     */
    @EntityGraph(
            attributePaths = {
                    "userA",
                    "userB"
            }
    )
    @Query(
            value = """
                    SELECT chatRoom
                    FROM ChatRoom chatRoom
                    WHERE (
                        chatRoom.userA.id = :userId
                        AND chatRoom.userB.deletedAt IS NULL
                    )
                    OR (
                        chatRoom.userB.id = :userId
                        AND chatRoom.userA.deletedAt IS NULL
                    )
                    ORDER BY
                        chatRoom.updatedAt DESC,
                        chatRoom.id DESC
                    """,
            countQuery = """
                    SELECT COUNT(chatRoom)
                    FROM ChatRoom chatRoom
                    WHERE (
                        chatRoom.userA.id = :userId
                        AND chatRoom.userB.deletedAt IS NULL
                    )
                    OR (
                        chatRoom.userB.id = :userId
                        AND chatRoom.userA.deletedAt IS NULL
                    )
                    """
    )
    Page<ChatRoom> findChatRoomPageByUserId(
            @Param("userId")
            Long userId,

            Pageable pageable
    );

    /*
     * 같은 채팅방의 메시지는 한 요청씩 순서대로 저장한다.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT chatRoom
            FROM ChatRoom chatRoom
            JOIN FETCH chatRoom.userA
            JOIN FETCH chatRoom.userB
            WHERE chatRoom.id = :roomId
            """)
    Optional<ChatRoom> findByIdForUpdate(
            @Param("roomId")
            Long roomId
    );

    @Query("""
        SELECT DISTINCT
            CASE
                WHEN chatRoom.userA.id = :userId
                    THEN chatRoom.userB.id
                ELSE chatRoom.userA.id
            END
        FROM ChatRoom chatRoom
        WHERE chatRoom.userA.id = :userId
           OR chatRoom.userB.id = :userId
        """)
    List<Long> findPartnerUserIds(
            @Param("userId")
            Long userId
    );
}
package GourmetCommunity.repository;

import GourmetCommunity.entity.ChatMessage;
import GourmetCommunity.repository.projection.ChatRoomUnreadCountProjection;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository
        extends JpaRepository<ChatMessage, Long> {

    /*
     * 같은 메시지의 재전송 여부를 현재 DB 상태에서
     * 확인하기 위한 잠금 조회다.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT message
            FROM ChatMessage message
            JOIN FETCH message.sender
            WHERE message.room.id = :roomId
              AND message.sender.id = :senderId
              AND message.clientMessageId = :clientMessageId
            """)
    Optional<ChatMessage>
    findDuplicateForUpdate(
            @Param("roomId")
            Long roomId,

            @Param("senderId")
            Long senderId,

            @Param("clientMessageId")
            String clientMessageId
    );

    @EntityGraph(
            attributePaths = "sender"
    )
    @Query("""
            SELECT message
            FROM ChatMessage message
            WHERE message.room.id = :roomId
            ORDER BY message.sequence DESC
            """)
    List<ChatMessage> findLatestMessages(
            @Param("roomId")
            Long roomId,

            Pageable pageable
    );

    @EntityGraph(
            attributePaths = "sender"
    )
    @Query("""
            SELECT message
            FROM ChatMessage message
            WHERE message.room.id = :roomId
              AND message.sequence < :beforeSequence
            ORDER BY message.sequence DESC
            """)
    List<ChatMessage> findMessagesBefore(
            @Param("roomId")
            Long roomId,

            @Param("beforeSequence")
            Long beforeSequence,

            Pageable pageable
    );

    @Query("""
        SELECT COALESCE(MAX(message.sequence), 0)
        FROM ChatMessage message
        WHERE message.room.id = :roomId
        """)
    long findMaxSequenceByRoomId(
            @Param("roomId")
            Long roomId
    );

    @Query("""
        SELECT message
        FROM ChatMessage message
        JOIN FETCH message.sender
        WHERE message.room.id IN :roomIds
          AND message.sequence = (
              SELECT MAX(comparedMessage.sequence)
              FROM ChatMessage comparedMessage
              WHERE comparedMessage.room.id =
                    message.room.id
          )
        """)
    List<ChatMessage> findLatestMessagesByRoomIds(
            @Param("roomIds")
            List<Long> roomIds
    );

    @Query("""
        SELECT
            message.room.id AS roomId,
            COUNT(message.id) AS unreadCount
        FROM ChatMessage message
        WHERE message.room.id IN :roomIds
          AND message.sender.id <> :userId
          AND message.sequence > COALESCE(
              (
                  SELECT readState.lastReadSequence
                  FROM ChatReadState readState
                  WHERE readState.room.id =
                        message.room.id
                    AND readState.user.id =
                        :userId
              ),
              0
          )
        GROUP BY message.room.id
        """)
    List<ChatRoomUnreadCountProjection>
    findUnreadCountsByRoomIds(
            @Param("roomIds")
            List<Long> roomIds,

            @Param("userId")
            Long userId
    );

    @Query("""
        SELECT COUNT(message.id)
        FROM ChatMessage message
        WHERE message.sender.id <> :userId
          AND (
                 (
                     message.room.userA.id = :userId
                     AND message.room.userB.deletedAt IS NULL
                 )
              OR (
                     message.room.userB.id = :userId
                     AND message.room.userA.deletedAt IS NULL
                 )
          )
          AND message.sequence > COALESCE(
              (
                  SELECT readState.lastReadSequence
                  FROM ChatReadState readState
                  WHERE readState.room.id =
                        message.room.id
                    AND readState.user.id =
                        :userId
              ),
              0
          )
        """)
    long countUnreadMessagesByUserId(
            @Param("userId")
            Long userId
    );
}
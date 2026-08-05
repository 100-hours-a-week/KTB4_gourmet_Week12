package GourmetCommunity.repository;

import GourmetCommunity.entity.ChatReadState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ChatReadStateRepository
        extends JpaRepository<ChatReadState, Long> {

    Optional<ChatReadState>
    findByRoom_IdAndUser_Id(
            Long roomId,
            Long userId
    );

    boolean existsByRoom_IdAndUser_Id(
            Long roomId,
            Long userId
    );

    @Query("""
            SELECT readState.user.id
            FROM ChatReadState readState
            WHERE readState.room.id = :roomId
            """)
    List<Long> findUserIdsByRoomId(
            @Param("roomId")
            Long roomId
    );

    @Modifying(
            clearAutomatically = true,
            flushAutomatically = true
    )
    @Query("""
        UPDATE ChatReadState readState
        SET readState.lastReadSequence = :sequence,
            readState.lastReadAt = :readAt
        WHERE readState.room.id = :roomId
          AND readState.user.id = :userId
          AND readState.lastReadSequence < :sequence
        """)
    int advanceReadSequence(
            @Param("roomId")
            Long roomId,

            @Param("userId")
            Long userId,

            @Param("sequence")
            Long sequence,

            @Param("readAt")
            LocalDateTime readAt
    );
}
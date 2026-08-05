package GourmetCommunity.repository;

import GourmetCommunity.entity.FriendRequest;
import GourmetCommunity.entity.FriendRequestStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface FriendRequestRepository
        extends JpaRepository<FriendRequest, Long> {

    @EntityGraph(
            attributePaths = {
                    "sender",
                    "receiver"
            }
    )
    Optional<FriendRequest> findByPairKey(
            String pairKey
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(
            attributePaths = {
                    "sender",
                    "receiver"
            }
    )
    @Query("""
            SELECT request
            FROM FriendRequest request
            WHERE request.id = :requestId
            """)
    Optional<FriendRequest> findByIdForUpdate(
            @Param("requestId")
            Long requestId
    );

    @EntityGraph(
            attributePaths = {
                    "sender",
                    "receiver"
            }
    )
    List<FriendRequest>
    findAllByPairKeyInAndStatus(
            Collection<String> pairKeys,
            FriendRequestStatus status
    );

    @EntityGraph(
            attributePaths = {
                    "sender",
                    "receiver"
            }
    )
    Page<FriendRequest>
    findByReceiver_IdAndStatusOrderByCreatedAtDesc(
            Long receiverId,
            FriendRequestStatus status,
            Pageable pageable
    );

    @EntityGraph(
            attributePaths = {
                    "sender",
                    "receiver"
            }
    )
    Page<FriendRequest>
    findBySender_IdAndStatusOrderByCreatedAtDesc(
            Long senderId,
            FriendRequestStatus status,
            Pageable pageable
    );
}
package GourmetCommunity.entity;

import GourmetCommunity.domain.friend.FriendPairKey;
import GourmetCommunity.exception.FriendRequestConflictException;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Check;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "friend_requests",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_friend_requests_pair_key",
                        columnNames = "pair_key"
                )
        },
        indexes = {
                @Index(
                        name = "idx_friend_requests_sender_status",
                        columnList = "sender_id, status, created_at"
                ),
                @Index(
                        name = "idx_friend_requests_receiver_status",
                        columnList = "receiver_id, status, created_at"
                )
        }
)
@Check(
        constraints = "sender_id <> receiver_id"
)
@Getter
@NoArgsConstructor(
        access = AccessLevel.PROTECTED
)
public class FriendRequest {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    @Column(name = "friend_request_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "sender_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name =
                            "fk_friend_requests_sender"
            )
    )
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "receiver_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name =
                            "fk_friend_requests_receiver"
            )
    )
    private User receiver;

    @Column(
            name = "pair_key",
            nullable = false,
            length = 50
    )
    private String pairKey;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "status",
            nullable = false,
            length = 20
    )
    private FriendRequestStatus status;

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public FriendRequest(
            User sender,
            User receiver
    ) {
        validateUsers(sender, receiver);

        this.sender = sender;
        this.receiver = receiver;
        this.pairKey =
                FriendPairKey.of(
                        sender.getId(),
                        receiver.getId()
                );
        this.status =
                FriendRequestStatus.PENDING;
    }

    public Long getSenderId() {
        return sender.getId();
    }

    public Long getReceiverId() {
        return receiver.getId();
    }

    public boolean isPending() {
        return status
                == FriendRequestStatus.PENDING;
    }

    public boolean canBeReopened() {
        return status
                == FriendRequestStatus.REJECTED
                || status
                == FriendRequestStatus.CANCELED;
    }

    /**
     * 거절 또는 취소된 사용자 쌍이
     * 나중에 다시 요청할 때 기존 행을 재사용한다.
     */
    public void reopen(
            User newSender,
            User newReceiver
    ) {
        validateUsers(
                newSender,
                newReceiver
        );

        if (!canBeReopened()) {
            throw new FriendRequestConflictException(
                    "다시 요청할 수 없는 친구 요청 상태입니다."
            );
        }

        String newPairKey =
                FriendPairKey.of(
                        newSender.getId(),
                        newReceiver.getId()
                );

        if (!pairKey.equals(newPairKey)) {
            throw new FriendRequestConflictException(
                    "다른 사용자 관계로 요청을 변경할 수 없습니다."
            );
        }

        this.sender = newSender;
        this.receiver = newReceiver;
        this.status =
                FriendRequestStatus.PENDING;
        this.createdAt =
                LocalDateTime.now();
        this.respondedAt = null;
    }

    public void accept() {
        changePendingStatus(
                FriendRequestStatus.ACCEPTED
        );
    }

    public void reject() {
        changePendingStatus(
                FriendRequestStatus.REJECTED
        );
    }

    public void cancel() {
        changePendingStatus(
                FriendRequestStatus.CANCELED
        );
    }

    private void changePendingStatus(
            FriendRequestStatus nextStatus
    ) {
        if (!isPending()) {
            throw new FriendRequestConflictException(
                    "이미 처리된 친구 요청입니다."
            );
        }

        this.status = nextStatus;
        this.respondedAt =
                LocalDateTime.now();
    }

    private void validateUsers(
            User sender,
            User receiver
    ) {
        if (
                sender == null
                        || receiver == null
        ) {
            throw new FriendRequestConflictException(
                    "요청자와 수신자 정보가 필요합니다."
            );
        }

        if (
                sender.getId() == null
                        || receiver.getId() == null
        ) {
            throw new FriendRequestConflictException(
                    "저장된 사용자만 친구 요청을 처리할 수 있습니다."
            );
        }

        if (
                sender.getId()
                        .equals(receiver.getId())
        ) {
            throw new FriendRequestConflictException(
                    "자기 자신에게 친구 요청을 보낼 수 없습니다."
            );
        }
    }

    @PrePersist
    private void prePersist() {
        LocalDateTime now =
                LocalDateTime.now();

        if (createdAt == null) {
            this.createdAt = now;
        }

        this.updatedAt = now;
    }

    @PreUpdate
    private void preUpdate() {
        this.updatedAt =
                LocalDateTime.now();
    }
}
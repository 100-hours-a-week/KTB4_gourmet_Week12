package GourmetCommunity.entity;

import GourmetCommunity.domain.friend.FriendPairKey;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Check;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "chat_rooms",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_chat_rooms_pair_key",
                        columnNames = "pair_key"
                )
        },
        indexes = {
                @Index(
                        name = "idx_chat_rooms_user_a",
                        columnList = "user_a_id"
                ),
                @Index(
                        name = "idx_chat_rooms_user_b",
                        columnList = "user_b_id"
                )
        }
)
@Check(
        constraints =
                "user_a_id <> user_b_id"
)
@Getter
@NoArgsConstructor(
        access = AccessLevel.PROTECTED
)
public class ChatRoom {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    @Column(name = "chat_room_id")
    private Long id;

    /*
     * 항상 ID가 작은 사용자를 userA에 저장한다.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_a_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_chat_rooms_user_a"
            )
    )
    private User userA;

    /*
     * 항상 ID가 큰 사용자를 userB에 저장한다.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_b_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_chat_rooms_user_b"
            )
    )
    private User userB;

    @Column(
            name = "pair_key",
            nullable = false,
            length = 50
    )
    private String pairKey;

    /*
     * 채팅방 내부 메시지 순서를 발급할 값이다.
     *
     * 이후 메시지 저장 시 채팅방 행을 잠근 다음
     * 이 값을 증가시켜 동일 방 메시지의 순서를 보장한다.
     */
    @Column(
            name = "next_message_sequence",
            nullable = false
    )
    private Long nextMessageSequence;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    public ChatRoom(
            User firstUser,
            User secondUser
    ) {
        validateUsers(
                firstUser,
                secondUser
        );

        if (
                firstUser.getId()
                        < secondUser.getId()
        ) {
            this.userA = firstUser;
            this.userB = secondUser;
        } else {
            this.userA = secondUser;
            this.userB = firstUser;
        }

        this.pairKey =
                FriendPairKey.of(
                        firstUser.getId(),
                        secondUser.getId()
                );

        this.nextMessageSequence = 1L;
    }

    public boolean containsUser(
            Long userId
    ) {
        if (userId == null) {
            return false;
        }

        return userA.getId().equals(userId)
                || userB.getId().equals(userId);
    }

    public User getOtherUser(
            Long userId
    ) {
        if (userId == null) {
            throw new IllegalArgumentException(
                    "사용자 ID가 필요합니다."
            );
        }

        if (
                userA.getId()
                        .equals(userId)
        ) {
            return userB;
        }

        if (
                userB.getId()
                        .equals(userId)
        ) {
            return userA;
        }

        throw new IllegalArgumentException(
                "채팅방에 참여하지 않은 사용자입니다."
        );
    }

    /*
     * 이 메서드는 채팅방 행의 비관적 잠금을
     * 획득한 상태에서만 호출한다.
     */
    public long issueNextMessageSequence() {
        long issuedSequence =
                nextMessageSequence;

        nextMessageSequence =
                nextMessageSequence + 1;

        return issuedSequence;
    }

    private void validateUsers(
            User firstUser,
            User secondUser
    ) {
        if (
                firstUser == null
                        || secondUser == null
        ) {
            throw new IllegalArgumentException(
                    "채팅방 사용자 정보가 필요합니다."
            );
        }

        if (
                firstUser.getId() == null
                        || secondUser.getId() == null
        ) {
            throw new IllegalArgumentException(
                    "저장된 사용자만 채팅방을 만들 수 있습니다."
            );
        }

        if (
                firstUser.getId()
                        .equals(secondUser.getId())
        ) {
            throw new IllegalArgumentException(
                    "자기 자신과 채팅방을 만들 수 없습니다."
            );
        }
    }

    @PrePersist
    private void prePersist() {
        LocalDateTime now =
                LocalDateTime.now();

        this.createdAt = now;
        this.updatedAt = now;

        if (nextMessageSequence == null) {
            this.nextMessageSequence = 1L;
        }
    }

    @PreUpdate
    private void preUpdate() {
        this.updatedAt =
                LocalDateTime.now();
    }
}
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
        name = "friendships",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_friendships_pair_key",
                        columnNames = "pair_key"
                )
        },
        indexes = {
                @Index(
                        name = "idx_friendships_user_a",
                        columnList = "user_a_id"
                ),
                @Index(
                        name = "idx_friendships_user_b",
                        columnList = "user_b_id"
                )
        }
)
@Check(
        constraints =
                "user_a_id <> user_b_id"
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Friendship {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    @Column(name = "friendship_id")
    private Long id;

    /*
     * 항상 ID가 작은 사용자를 userA에 저장한다.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_a_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_friendships_user_a"
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
                    name = "fk_friendships_user_b"
            )
    )
    private User userB;

    @Column(
            name = "pair_key",
            nullable = false,
            length = 50
    )
    private String pairKey;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    public Friendship(
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
    }

    public boolean containsUser(
            Long userId
    ) {
        return userA.getId().equals(userId)
                || userB.getId().equals(userId);
    }

    public Long getOtherUserId(
            Long userId
    ) {
        return getOtherUser(userId)
                .getId();
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
                "친구 관계에 포함되지 않은 사용자입니다."
        );
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
                    "친구 관계 사용자 정보가 필요합니다."
            );
        }

        if (
                firstUser.getId() == null
                        || secondUser.getId() == null
        ) {
            throw new IllegalArgumentException(
                    "저장된 사용자만 친구 관계를 만들 수 있습니다."
            );
        }

        if (
                firstUser.getId()
                        .equals(secondUser.getId())
        ) {
            throw new IllegalArgumentException(
                    "자기 자신과 친구 관계를 만들 수 없습니다."
            );
        }
    }

    @PrePersist
    private void prePersist() {
        this.createdAt =
                LocalDateTime.now();
    }
}
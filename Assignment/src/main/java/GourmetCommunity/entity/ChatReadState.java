package GourmetCommunity.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Check;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "chat_read_states",
        uniqueConstraints = {
                @UniqueConstraint(
                        name =
                                "uq_chat_read_states_room_user",
                        columnNames = {
                                "chat_room_id",
                                "user_id"
                        }
                )
        },
        indexes = {
                @Index(
                        name =
                                "idx_chat_read_states_user",
                        columnList = "user_id"
                )
        }
)
@Check(
        constraints =
                "last_read_sequence >= 0"
)
@Getter
@NoArgsConstructor(
        access = AccessLevel.PROTECTED
)
public class ChatReadState {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    @Column(name = "chat_read_state_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "chat_room_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name =
                            "fk_chat_read_states_room"
            )
    )
    private ChatRoom room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name =
                            "fk_chat_read_states_user"
            )
    )
    private User user;

    @Column(
            name = "last_read_sequence",
            nullable = false
    )
    private Long lastReadSequence;

    @Column(name = "last_read_at")
    private LocalDateTime lastReadAt;

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

    public ChatReadState(
            ChatRoom room,
            User user
    ) {
        if (room == null || user == null) {
            throw new IllegalArgumentException(
                    "읽음 상태에 필요한 정보가 없습니다."
            );
        }

        if (
                !room.containsUser(
                        user.getId()
                )
        ) {
            throw new IllegalArgumentException(
                    "채팅방 참여자만 읽음 상태를 가질 수 있습니다."
            );
        }

        this.room = room;
        this.user = user;
        this.lastReadSequence = 0L;
    }

    public void advanceTo(
            long sequence
    ) {
        if (sequence < 0) {
            throw new IllegalArgumentException(
                    "읽음 순서가 올바르지 않습니다."
            );
        }

        /*
         * 읽음 위치는 절대 뒤로 돌아가지 않는다.
         */
        if (sequence <= lastReadSequence) {
            return;
        }

        this.lastReadSequence = sequence;
        this.lastReadAt =
                LocalDateTime.now();
    }

    @PrePersist
    private void prePersist() {
        LocalDateTime now =
                LocalDateTime.now();

        this.createdAt = now;
        this.updatedAt = now;

        if (lastReadSequence == null) {
            this.lastReadSequence = 0L;
        }
    }

    @PreUpdate
    private void preUpdate() {
        this.updatedAt =
                LocalDateTime.now();
    }
}
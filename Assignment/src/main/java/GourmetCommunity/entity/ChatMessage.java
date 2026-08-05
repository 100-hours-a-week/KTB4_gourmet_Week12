package GourmetCommunity.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "chat_messages",
        uniqueConstraints = {
                @UniqueConstraint(
                        name =
                                "uq_chat_messages_room_sequence",
                        columnNames = {
                                "chat_room_id",
                                "message_sequence"
                        }
                ),
                @UniqueConstraint(
                        name =
                                "uq_chat_messages_room_sender_client",
                        columnNames = {
                                "chat_room_id",
                                "sender_id",
                                "client_message_id"
                        }
                )
        },
        indexes = {
                @Index(
                        name =
                                "idx_chat_messages_room_sequence",
                        columnList =
                                "chat_room_id,message_sequence"
                )
        }
)
@Getter
@NoArgsConstructor(
        access = AccessLevel.PROTECTED
)
public class ChatMessage {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    @Column(name = "chat_message_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "chat_room_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name =
                            "fk_chat_messages_room"
            )
    )
    private ChatRoom room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "sender_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name =
                            "fk_chat_messages_sender"
            )
    )
    private User sender;

    /*
     * 채팅방 내부에서만 사용하는 순서다.
     *
     * ChatRoom 행을 잠근 후 발급하므로
     * 같은 방에서는 중복되지 않는다.
     */
    @Column(
            name = "message_sequence",
            nullable = false
    )
    private Long sequence;

    /*
     * 브라우저가 메시지를 전송할 때 생성하는 UUID.
     *
     * 네트워크 재전송이 발생해도 동일 UUID라면
     * 같은 메시지로 처리한다.
     */
    @Column(
            name = "client_message_id",
            nullable = false,
            length = 36
    )
    private String clientMessageId;

    @Column(
            nullable = false,
            length = 2000
    )
    private String content;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    public ChatMessage(
            ChatRoom room,
            User sender,
            long sequence,
            String clientMessageId,
            String content
    ) {
        validate(
                room,
                sender,
                sequence,
                clientMessageId,
                content
        );

        this.room = room;
        this.sender = sender;
        this.sequence = sequence;
        this.clientMessageId =
                clientMessageId;
        this.content = content;
    }

    private void validate(
            ChatRoom room,
            User sender,
            long sequence,
            String clientMessageId,
            String content
    ) {
        if (room == null) {
            throw new IllegalArgumentException(
                    "채팅방 정보가 필요합니다."
            );
        }

        if (sender == null) {
            throw new IllegalArgumentException(
                    "메시지 발신자 정보가 필요합니다."
            );
        }

        if (
                !room.containsUser(
                        sender.getId()
                )
        ) {
            throw new IllegalArgumentException(
                    "채팅방 참여자만 메시지를 보낼 수 있습니다."
            );
        }

        if (sequence < 1) {
            throw new IllegalArgumentException(
                    "메시지 순서가 올바르지 않습니다."
            );
        }

        if (
                clientMessageId == null
                        || clientMessageId.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "클라이언트 메시지 ID가 필요합니다."
            );
        }

        if (
                content == null
                        || content.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "메시지 내용을 입력해주세요."
            );
        }

        if (content.length() > 2000) {
            throw new IllegalArgumentException(
                    "메시지는 2000자 이하로 입력해주세요."
            );
        }
    }

    @PrePersist
    private void prePersist() {
        this.createdAt =
                LocalDateTime.now();
    }
}
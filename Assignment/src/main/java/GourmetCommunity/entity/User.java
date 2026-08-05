package GourmetCommunity.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_users_email",
                        columnNames = "email"
                ),
                @UniqueConstraint(
                        name = "uq_users_nickname",
                        columnNames = "nickname"
                )
        }
)
@Getter
@NoArgsConstructor(
        access = AccessLevel.PROTECTED
)
public class User {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    @Column(name = "user_id")
    private Long id;

    @Column(
            nullable = false,
            length = 100
    )
    private String email;

    @Column(
            nullable = false,
            length = 255
    )
    private String password;

    @Column(
            nullable = false,
            length = 50
    )
    private String nickname;

    @Column(
            name = "profile_image",
            length = 500
    )
    private String profileImage;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public User(
            String email,
            String password,
            String nickname,
            String profileImage
    ) {
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.profileImage = profileImage;
    }

    public void update(
            String nickname
    ) {
        this.nickname = nickname;
    }

    public void updateProfileImage(
            String profileImage
    ) {
        this.profileImage =
                profileImage;
    }

    public void delete(
            String deletedEmail,
            String deletedNickname,
            String deletedPassword
    ) {
        if (deletedAt != null) {
            throw new IllegalStateException(
                    "이미 탈퇴한 회원입니다."
            );
        }

        validateDeletedIdentity(
                deletedEmail,
                deletedNickname,
                deletedPassword
        );

        this.deletedAt =
                LocalDateTime.now();

        this.email =
                deletedEmail;

        this.nickname =
                deletedNickname;

        this.password =
                deletedPassword;

        this.profileImage = null;
    }

    public void updatePassword(
            String password
    ) {
        this.password = password;
    }

    private void validateDeletedIdentity(
            String deletedEmail,
            String deletedNickname,
            String deletedPassword
    ) {
        if (
                deletedEmail == null
                        || deletedEmail.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "탈퇴 회원 이메일이 필요합니다."
            );
        }

        if (
                deletedNickname == null
                        || deletedNickname.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "탈퇴 회원 닉네임이 필요합니다."
            );
        }

        if (
                deletedPassword == null
                        || deletedPassword.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "탈퇴 회원 비밀번호가 필요합니다."
            );
        }

        if (deletedEmail.length() > 100) {
            throw new IllegalArgumentException(
                    "탈퇴 회원 이메일 길이가 올바르지 않습니다."
            );
        }

        if (deletedNickname.length() > 50) {
            throw new IllegalArgumentException(
                    "탈퇴 회원 닉네임 길이가 올바르지 않습니다."
            );
        }

        if (deletedPassword.length() > 255) {
            throw new IllegalArgumentException(
                    "탈퇴 회원 비밀번호 길이가 올바르지 않습니다."
            );
        }
    }

    @PrePersist
    public void prePersist() {
        this.createdAt =
                LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt =
                LocalDateTime.now();
    }
}
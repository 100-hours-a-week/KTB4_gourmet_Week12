package GourmetCommunity.domain.user;

import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class DeletedUserIdentityGenerator {

    private static final String
            DELETED_EMAIL_PREFIX =
            "deleted_";

    private static final String
            DELETED_EMAIL_DOMAIN =
            "@deleted.invalid";

    private static final String
            DELETED_NICKNAME_PREFIX =
            "__deleted__";

    public DeletedUserIdentity generate() {
        String token =
                UUID.randomUUID()
                        .toString()
                        .replace("-", "");

        String email =
                DELETED_EMAIL_PREFIX
                        + token
                        + DELETED_EMAIL_DOMAIN;

        String nickname =
                DELETED_NICKNAME_PREFIX
                        + token;

        return new DeletedUserIdentity(
                email,
                nickname
        );
    }
}
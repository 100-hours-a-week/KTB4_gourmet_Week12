package GourmetCommunity.domain.user;

import GourmetCommunity.exception.InvalidUserIdentityException;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class UserIdentityPolicy {

    private static final String
            DELETED_EMAIL_DOMAIN =
            "@deleted.invalid";

    private static final String
            DELETED_NICKNAME_PREFIX =
            "__deleted__";

    public void validateSignupIdentity(
            String email,
            String nickname
    ) {
        validateEmail(email);
        validateNickname(nickname);
    }

    public void validateEmail(
            String email
    ) {
        if (
                email == null
                        || email.isBlank()
        ) {
            throw new InvalidUserIdentityException(
                    "이메일을 입력해주세요."
            );
        }

        String normalizedEmail =
                email.trim()
                        .toLowerCase(
                                Locale.ROOT
                        );

        if (
                normalizedEmail.endsWith(
                        DELETED_EMAIL_DOMAIN
                )
        ) {
            throw new InvalidUserIdentityException(
                    "사용할 수 없는 이메일입니다."
            );
        }
    }

    public void validateNickname(
            String nickname
    ) {
        if (
                nickname == null
                        || nickname.isBlank()
        ) {
            throw new InvalidUserIdentityException(
                    "닉네임을 입력해주세요."
            );
        }

        String normalizedNickname =
                nickname.trim()
                        .toLowerCase(
                                Locale.ROOT
                        );

        /*
         * DB 문자 비교가 대소문자를 구분하지 않는
         * 설정일 수 있으므로 소문자로 비교한다.
         */
        if (
                normalizedNickname.startsWith(
                        DELETED_NICKNAME_PREFIX
                )
        ) {
            throw new InvalidUserIdentityException(
                    "사용할 수 없는 닉네임입니다."
            );
        }
    }
}
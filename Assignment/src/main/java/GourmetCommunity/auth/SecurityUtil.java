package GourmetCommunity.auth;

import GourmetCommunity.exception.ForbiddenException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public final class SecurityUtil {

    private SecurityUtil() {
    }

    public static Long getLoginUserId() {
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (!isAuthenticated(authentication)) {
            throw new ForbiddenException("접근 권한이 없습니다.");
        }

        return Long.valueOf(authentication.getPrincipal().toString());
    }

    public static Optional<Long> getOptionalLoginUserId() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (!isAuthenticated(authentication)) {
            return Optional.empty();
        }

        try {
            return Optional.of(
                    Long.valueOf(
                            authentication.getPrincipal().toString()
                    )
            );
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }

    public static void validateLoginUser(Long targetUserId) {
        Long loginUserId = getLoginUserId();

        if (!loginUserId.equals(targetUserId)) {
            throw new ForbiddenException("접근 권한이 없습니다.");
        }
    }

    private static boolean isAuthenticated(
            Authentication authentication
    ) {
        return authentication != null
                && authentication.isAuthenticated()
                && !(authentication
                instanceof AnonymousAuthenticationToken)
                && authentication.getPrincipal() != null;
    }
}
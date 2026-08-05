package GourmetCommunity.websocket;

import GourmetCommunity.exception.ForbiddenException;
import org.springframework.stereotype.Component;

import java.security.Principal;

@Component
public class WebSocketUserIdResolver {

    public Long resolve(
            Principal principal
    ) {
        if (
                principal == null
                        || principal.getName() == null
                        || principal.getName().isBlank()
        ) {
            throw new ForbiddenException(
                    "WebSocket 인증 정보가 없습니다."
            );
        }

        try {
            return Long.valueOf(
                    principal.getName()
            );
        } catch (
                NumberFormatException exception
        ) {
            throw new ForbiddenException(
                    "WebSocket 인증 정보가 올바르지 않습니다."
            );
        }
    }
}
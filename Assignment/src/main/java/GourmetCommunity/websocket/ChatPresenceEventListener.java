package GourmetCommunity.websocket;

import GourmetCommunity.service.ChatPresencePublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;

@Component
@RequiredArgsConstructor
public class ChatPresenceEventListener {

    private final ChatPresenceRegistry
            chatPresenceRegistry;

    private final ChatPresencePublisher
            chatPresencePublisher;

    @EventListener
    public void handleConnected(
            SessionConnectedEvent event
    ) {
        Principal principal =
                event.getUser();

        if (principal == null) {
            return;
        }

        Long userId =
                parseUserId(principal);

        StompHeaderAccessor accessor =
                StompHeaderAccessor.wrap(
                        event.getMessage()
                );

        String sessionId =
                accessor.getSessionId();

        boolean becameOnline =
                chatPresenceRegistry
                        .register(
                                sessionId,
                                userId
                        );

        if (becameOnline) {
            chatPresencePublisher
                    .publishToPartners(
                            userId,
                            true
                    );
        }
    }

    @EventListener
    public void handleDisconnected(
            SessionDisconnectEvent event
    ) {
        ChatPresenceRegistry
                .PresenceDisconnectResult result =
                chatPresenceRegistry
                        .unregister(
                                event.getSessionId()
                        );

        if (
                result.userId() != null
                        && result.becameOffline()
        ) {
            chatPresencePublisher
                    .publishToPartners(
                            result.userId(),
                            false
                    );
        }
    }

    private Long parseUserId(
            Principal principal
    ) {
        try {
            return Long.valueOf(
                    principal.getName()
            );
        } catch (
                NumberFormatException exception
        ) {
            throw new IllegalStateException(
                    "WebSocket 사용자 ID가 올바르지 않습니다.",
                    exception
            );
        }
    }
}
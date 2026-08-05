package GourmetCommunity.websocket;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.security.Principal;

@Component
public class ChatInboundChannelInterceptor
        implements ChannelInterceptor {

    @Override
    public Message<?> preSend(
            Message<?> message,
            MessageChannel channel
    ) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(
                        message,
                        StompHeaderAccessor.class
                );

        if (accessor == null) {
            return message;
        }

        StompCommand command =
                accessor.getCommand();

        if (command == null) {
            return message;
        }

        /*
         * 실제 메시지 송신과 구독 시점에는
         * 반드시 HTTP Handshake에서 설정된
         * 인증 Principal이 존재해야 한다.
         */
        if (
                command == StompCommand.SEND
                        || command == StompCommand.SUBSCRIBE
        ) {
            validateAuthenticatedUser(
                    accessor.getUser()
            );
        }

        if (command == StompCommand.SEND) {
            validateSendDestination(
                    accessor.getDestination()
            );
        }

        if (command == StompCommand.SUBSCRIBE) {
            validateSubscribeDestination(
                    accessor.getDestination()
            );
        }

        return message;
    }

    private void validateAuthenticatedUser(
            Principal principal
    ) {
        if (
                principal == null
                        || principal.getName() == null
                        || principal.getName().isBlank()
        ) {
            throw new AccessDeniedException(
                    "WebSocket 인증이 필요합니다."
            );
        }
    }

    private void validateSendDestination(
            String destination
    ) {
        if (
                destination == null
                        || !destination.startsWith(
                        "/app/chat/"
                )
        ) {
            throw new AccessDeniedException(
                    "허용되지 않은 메시지 전송 경로입니다."
            );
        }
    }

    private void validateSubscribeDestination(
            String destination
    ) {
        /*
         * 사용자는 공용 /queue가 아니라
         * 자신의 /user/queue/chat/... 경로만 구독한다.
         */
        if (
                destination == null
                        || !destination.startsWith(
                        "/user/queue/chat/"
                )
        ) {
            throw new AccessDeniedException(
                    "허용되지 않은 구독 경로입니다."
            );
        }
    }
}
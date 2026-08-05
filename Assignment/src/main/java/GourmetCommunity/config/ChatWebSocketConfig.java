package GourmetCommunity.config;

import GourmetCommunity.websocket.ChatInboundChannelInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class ChatWebSocketConfig
        implements WebSocketMessageBrokerConfigurer {

    private final ChatInboundChannelInterceptor
            chatInboundChannelInterceptor;

    /*
     * 브라우저가 최초 WebSocket 연결을 맺는 주소다.
     *
     * 프론트에서는 Nginx/Vite 프록시를 거쳐
     * /api/ws/chat으로 연결하고,
     * 백엔드에는 /ws/chat으로 전달한다.
     */
    @Override
    public void registerStompEndpoints(
            StompEndpointRegistry registry
    ) {
        registry
                .addEndpoint("/ws/chat")
                .setAllowedOrigins(
                        "http://localhost",
                        "http://127.0.0.1",
                        "http://localhost:5173",
                        "http://127.0.0.1:5173",
                        "http://13.209.8.97"
                );
    }

    @Override
    public void configureMessageBroker(
            MessageBrokerRegistry registry
    ) {
        /*
         * 클라이언트가 서버 메서드로 메시지를 보낼 때:
         * /app/chat/...
         */
        registry.setApplicationDestinationPrefixes(
                "/app"
        );

        /*
         * 서버가 사용자별 메시지를 전달할 때:
         * /user/queue/chat/...
         */
        registry.setUserDestinationPrefix(
                "/user"
        );

        registry.enableSimpleBroker(
                "/queue"
        );
    }

    @Override
    public void configureClientInboundChannel(
            ChannelRegistration registration
    ) {
        registration.interceptors(
                chatInboundChannelInterceptor
        );
    }
}
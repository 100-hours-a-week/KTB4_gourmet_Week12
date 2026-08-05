package GourmetCommunity.service;

import GourmetCommunity.dto.NotificationResponseDto;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NotificationSseService {

    private static final long SSE_TIMEOUT =
            60L * 60L * 1000L;

    private static final long RECONNECT_TIME =
            3_000L;

    private final Map<
            Long,
            Map<String, SseEmitter>
            > emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Long userId) {
        String connectionId =
                UUID.randomUUID().toString();

        SseEmitter emitter =
                new SseEmitter(SSE_TIMEOUT);

        emitters
                .computeIfAbsent(
                        userId,
                        key -> new ConcurrentHashMap<>()
                )
                .put(connectionId, emitter);

        emitter.onCompletion(() ->
                removeEmitter(
                        userId,
                        connectionId
                )
        );

        emitter.onTimeout(() -> {
            removeEmitter(
                    userId,
                    connectionId
            );

            emitter.complete();
        });

        emitter.onError(error ->
                removeEmitter(
                        userId,
                        connectionId
                )
        );

        try {
            emitter.send(
                    SseEmitter.event()
                            .name("connected")
                            .reconnectTime(
                                    RECONNECT_TIME
                            )
                            .data(
                                    Map.of(
                                            "connectionId",
                                            connectionId
                                    )
                            )
            );
        } catch (IOException exception) {
            removeEmitter(
                    userId,
                    connectionId
            );

            emitter.completeWithError(exception);
        }

        return emitter;
    }

    public void sendNotification(
            Long receiverId,
            NotificationResponseDto notification
    ) {
        Map<String, SseEmitter> userEmitters =
                emitters.get(receiverId);

        if (
                userEmitters == null
                        || userEmitters.isEmpty()
        ) {
            return;
        }

        userEmitters.forEach(
                (connectionId, emitter) -> {
                    try {
                        emitter.send(
                                SseEmitter.event()
                                        .id(
                                                String.valueOf(
                                                        notification
                                                                .getId()
                                                )
                                        )
                                        .name("notification")
                                        .reconnectTime(
                                                RECONNECT_TIME
                                        )
                                        .data(notification)
                        );
                    } catch (
                            IOException
                            | IllegalStateException exception
                    ) {
                        removeEmitter(
                                receiverId,
                                connectionId
                        );

                        emitter.completeWithError(
                                exception
                        );
                    }
                }
        );
    }

    public void sendNotificationRemoved(
            Long receiverId,
            Long notificationId
    ) {
        Map<String, SseEmitter> userEmitters =
                emitters.get(receiverId);

        if (
                userEmitters == null
                        || userEmitters.isEmpty()
        ) {
            return;
        }

        userEmitters.forEach(
                (connectionId, emitter) -> {
                    try {
                        emitter.send(
                                SseEmitter.event()
                                        .name(
                                                "notification-removed"
                                        )
                                        .data(
                                                Map.of(
                                                        "notificationId",
                                                        notificationId
                                                )
                                        )
                        );
                    } catch (
                            IOException
                            | IllegalStateException exception
                    ) {
                        removeEmitter(
                                receiverId,
                                connectionId
                        );

                        emitter.completeWithError(
                                exception
                        );
                    }
                }
        );
    }

    public void sendNotificationReadAll(
            Long receiverId
    ) {
        Map<String, SseEmitter> userEmitters =
                emitters.get(receiverId);

        if (
                userEmitters == null
                        || userEmitters.isEmpty()
        ) {
            return;
        }

        userEmitters.forEach(
                (connectionId, emitter) -> {
                    try {
                        emitter.send(
                                SseEmitter.event()
                                        .name(
                                                "notifications-read-all"
                                        )
                                        .data(
                                                Map.of(
                                                        "readAll",
                                                        true
                                                )
                                        )
                        );
                    } catch (
                            IOException
                            | IllegalStateException exception
                    ) {
                        removeEmitter(
                                receiverId,
                                connectionId
                        );

                        emitter.completeWithError(
                                exception
                        );
                    }
                }
        );
    }

    private void removeEmitter(
            Long userId,
            String connectionId
    ) {
        Map<String, SseEmitter> userEmitters =
                emitters.get(userId);

        if (userEmitters == null) {
            return;
        }

        userEmitters.remove(connectionId);

        if (userEmitters.isEmpty()) {
            emitters.remove(userId);
        }
    }
}
package GourmetCommunity.websocket;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Component
public class ChatPresenceRegistry {

    private final Map<String, Long>
            sessionUserMap =
            new HashMap<>();

    private final Map<Long, Set<String>>
            userSessionMap =
            new HashMap<>();

    /*
     * 반환값 true:
     * 해당 사용자가 오프라인에서 온라인으로 전환됨.
     */
    public synchronized boolean register(
            String sessionId,
            Long userId
    ) {
        if (
                sessionId == null
                        || userId == null
        ) {
            return false;
        }

        if (sessionUserMap.containsKey(sessionId)) {
            return false;
        }

        Set<String> sessions =
                userSessionMap.computeIfAbsent(
                        userId,
                        ignored -> new HashSet<>()
                );

        boolean wasOffline =
                sessions.isEmpty();

        sessions.add(sessionId);

        sessionUserMap.put(
                sessionId,
                userId
        );

        return wasOffline;
    }

    /*
     * 반환값 true:
     * 해당 사용자의 마지막 세션이 종료됨.
     */
    public synchronized PresenceDisconnectResult
    unregister(
            String sessionId
    ) {
        Long userId =
                sessionUserMap.remove(
                        sessionId
                );

        if (userId == null) {
            return new PresenceDisconnectResult(
                    null,
                    false
            );
        }

        Set<String> sessions =
                userSessionMap.get(userId);

        if (sessions == null) {
            return new PresenceDisconnectResult(
                    userId,
                    false
            );
        }

        sessions.remove(sessionId);

        boolean becameOffline =
                sessions.isEmpty();

        if (becameOffline) {
            userSessionMap.remove(userId);
        }

        return new PresenceDisconnectResult(
                userId,
                becameOffline
        );
    }

    public synchronized boolean isOnline(
            Long userId
    ) {
        Set<String> sessions =
                userSessionMap.get(userId);

        return sessions != null
                && !sessions.isEmpty();
    }

    public record PresenceDisconnectResult(
            Long userId,
            boolean becameOffline
    ) {
    }
}
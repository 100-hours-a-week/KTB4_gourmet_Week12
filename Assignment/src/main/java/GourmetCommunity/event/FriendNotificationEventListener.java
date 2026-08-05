package GourmetCommunity.event;

import GourmetCommunity.service.FriendNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class FriendNotificationEventListener {

    private final FriendNotificationService
            friendNotificationService;

    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void handleCreated(
            FriendRequestCreatedEvent event
    ) {
        try {
            friendNotificationService
                    .notifyRequestCreated(
                            event.requestId(),
                            event.senderId(),
                            event.receiverId()
                    );
        } catch (RuntimeException exception) {
            log.error(
                    "친구 요청 알림 생성 실패. requestId={}",
                    event.requestId(),
                    exception
            );
        }
    }

    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void handleAccepted(
            FriendRequestAcceptedEvent event
    ) {
        try {
            friendNotificationService
                    .notifyRequestAccepted(
                            event.requestId(),
                            event.senderId(),
                            event.receiverId()
                    );
        } catch (RuntimeException exception) {
            log.error(
                    "친구 수락 알림 처리 실패. requestId={}",
                    event.requestId(),
                    exception
            );
        }
    }

    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void handleRejected(
            FriendRequestRejectedEvent event
    ) {
        try {
            friendNotificationService
                    .removePendingRequestNotification(
                            event.requestId()
                    );
        } catch (RuntimeException exception) {
            log.error(
                    "친구 거절 알림 제거 실패. requestId={}",
                    event.requestId(),
                    exception
            );
        }
    }

    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void handleCanceled(
            FriendRequestCanceledEvent event
    ) {
        try {
            friendNotificationService
                    .removePendingRequestNotification(
                            event.requestId()
                    );
        } catch (RuntimeException exception) {
            log.error(
                    "친구 요청 취소 알림 제거 실패. requestId={}",
                    event.requestId(),
                    exception
            );
        }
    }
}
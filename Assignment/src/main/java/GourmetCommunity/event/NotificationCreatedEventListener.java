package GourmetCommunity.event;

import GourmetCommunity.service.NotificationSseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;


@Component
@RequiredArgsConstructor
public class NotificationCreatedEventListener {

    private final NotificationSseService
            notificationSseService;

    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void handle(
            NotificationCreatedEvent event
    ) {
        notificationSseService.sendNotification(
                event.receiverId(),
                event.notification()
        );
    }

    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void handleRemoved(
            NotificationRemovedEvent event
    ) {
        notificationSseService
                .sendNotificationRemoved(
                        event.receiverId(),
                        event.notificationId()
                );
    }

    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void handleReadAll(
            NotificationReadAllEvent event
    ) {
        notificationSseService
                .sendNotificationReadAll(
                        event.receiverId()
                );
    }

}
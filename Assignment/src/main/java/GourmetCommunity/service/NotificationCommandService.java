package GourmetCommunity.service;

import GourmetCommunity.dto.NotificationResponseDto;
import GourmetCommunity.entity.Notification;
import GourmetCommunity.event.NotificationCreatedEvent;
import GourmetCommunity.event.NotificationRemovedEvent;
import GourmetCommunity.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationCommandService {

    private final NotificationRepository
            notificationRepository;

    private final ApplicationEventPublisher
            eventPublisher;

    /*
     * 반드시 이미 시작된 트랜잭션 안에서 호출한다.
     *
     * 알림 저장과 도메인 로직이 서로 다른
     * 트랜잭션으로 분리되는 것을 방지한다.
     */
    @Transactional(
            propagation = Propagation.MANDATORY
    )
    public Notification saveAndPublish(
            Notification notification
    ) {
        Notification savedNotification =
                notificationRepository
                        .saveAndFlush(
                                notification
                        );

        NotificationResponseDto response =
                new NotificationResponseDto(
                        savedNotification
                );

        eventPublisher.publishEvent(
                new NotificationCreatedEvent(
                        savedNotification
                                .getReceiverId(),
                        response
                )
        );

        return savedNotification;
    }

    @Transactional(
            propagation = Propagation.MANDATORY
    )
    public void deleteAndPublish(
            List<Notification> notifications
    ) {
        if (
                notifications == null
                        || notifications.isEmpty()
        ) {
            return;
        }

        List<NotificationRemovedEvent> events =
                notifications.stream()
                        .map(notification ->
                                new NotificationRemovedEvent(
                                        notification
                                                .getReceiverId(),
                                        notification.getId()
                                )
                        )
                        .toList();

        notificationRepository.deleteAll(
                notifications
        );

        notificationRepository.flush();

        events.forEach(
                eventPublisher::publishEvent
        );
    }
}
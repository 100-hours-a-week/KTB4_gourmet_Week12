package GourmetCommunity.service;

import GourmetCommunity.entity.ChatReadState;
import GourmetCommunity.entity.ChatRoom;
import GourmetCommunity.repository.ChatReadStateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ChatReadStateInitializer {

    private final ChatReadStateRepository
            chatReadStateRepository;

    @Transactional(
            propagation = Propagation.MANDATORY
    )
    public void ensureInitialized(
            ChatRoom chatRoom
    ) {
        Set<Long> initializedUserIds =
                new HashSet<>(
                        chatReadStateRepository
                                .findUserIdsByRoomId(
                                        chatRoom.getId()
                                )
                );

        List<ChatReadState> newStates =
                new ArrayList<>();

        if (
                !initializedUserIds.contains(
                        chatRoom
                                .getUserA()
                                .getId()
                )
        ) {
            newStates.add(
                    new ChatReadState(
                            chatRoom,
                            chatRoom.getUserA()
                    )
            );
        }

        if (
                !initializedUserIds.contains(
                        chatRoom
                                .getUserB()
                                .getId()
                )
        ) {
            newStates.add(
                    new ChatReadState(
                            chatRoom,
                            chatRoom.getUserB()
                    )
            );
        }

        if (newStates.isEmpty()) {
            return;
        }

        chatReadStateRepository
                .saveAll(newStates);

        chatReadStateRepository.flush();
    }
}
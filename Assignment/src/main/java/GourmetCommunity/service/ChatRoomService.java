package GourmetCommunity.service;

import GourmetCommunity.auth.SecurityUtil;
import GourmetCommunity.domain.friend.FriendPairKey;
import GourmetCommunity.dto.chat.ChatRoomResponseDto;
import GourmetCommunity.entity.ChatRoom;
import GourmetCommunity.exception.ChatRoomConflictException;
import GourmetCommunity.exception.ForbiddenException;
import GourmetCommunity.exception.InvalidChatRoomRequestException;
import GourmetCommunity.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatRoomService {

    private final ChatRoomRepository
            chatRoomRepository;

    private final FriendshipService
            friendshipService;

    private final FriendUserPairLockService
            friendUserPairLockService;

    private final ChatReadStateInitializer
            chatReadStateInitializer;

    /*
     * 친구와의 기존 1:1 채팅방을 반환하거나,
     * 존재하지 않으면 새 채팅방을 생성한다.
     *
     * 기존 방과 신규 방 모두 읽음 상태를
     * 두 사용자 기준으로 초기화한다.
     */
    @Transactional
    public ChatRoomResponseDto
    getOrCreateFriendChatRoom(
            Long friendUserId
    ) {
        Long loginUserId =
                SecurityUtil.getLoginUserId();

        validateRequest(
                loginUserId,
                friendUserId
        );

        /*
         * A-B와 B-A 요청이 동시에 들어와도
         * 작은 사용자 ID부터 동일한 순서로 잠근다.
         *
         * 첫 번째 요청이 Commit될 때까지
         * 두 번째 요청은 여기서 대기한다.
         */
        FriendUserPairLockService
                .LockedFriendUsers lockedUsers =
                friendUserPairLockService
                        .lockUsers(
                                loginUserId,
                                friendUserId
                        );

        String pairKey =
                FriendPairKey.of(
                        loginUserId,
                        friendUserId
                );

        /*
         * 친구 관계인 사용자 사이에서만
         * 채팅방을 만들 수 있다.
         */
        if (
                !friendshipService
                        .existsByPairKey(pairKey)
        ) {
            throw new ForbiddenException(
                    "친구 관계인 사용자와만 채팅할 수 있습니다."
            );
        }

        /*
         * 채팅방이 이미 존재하면 기존 방을 사용하고,
         * 없으면 새 채팅방을 생성한다.
         */
        ChatRoom chatRoom =
                chatRoomRepository
                        .findByPairKey(pairKey)
                        .orElseGet(() ->
                                createChatRoom(
                                        lockedUsers
                                )
                        );

        /*
         * 기존에 먼저 생성된 채팅방이더라도
         * 읽음 상태가 없다면 두 참여자 기준으로 생성한다.
         *
         * 같은 트랜잭션 안에서 실행되며,
         * ChatReadStateInitializer는
         * Propagation.MANDATORY를 사용한다.
         */
        chatReadStateInitializer
                .ensureInitialized(
                        chatRoom
                );

        return ChatRoomResponseDto
                .from(
                        chatRoom,
                        loginUserId
                );
    }

    /*
     * 새 채팅방을 생성하고 Entity를 반환한다.
     *
     * 읽음 상태 초기화와 DTO 변환은
     * 호출 메서드에서 공통 처리한다.
     */
    private ChatRoom createChatRoom(
            FriendUserPairLockService
                    .LockedFriendUsers lockedUsers
    ) {
        ChatRoom chatRoom =
                new ChatRoom(
                        lockedUsers.sender(),
                        lockedUsers.receiver()
                );

        try {
            return chatRoomRepository
                    .saveAndFlush(
                            chatRoom
                    );
        } catch (
                DataIntegrityViolationException exception
        ) {
            /*
             * 사용자 잠금이 정상 적용되면 일반적인
             * 동시 요청에서는 발생하지 않는다.
             *
             * pair_key UNIQUE 제약은 잠금을 우회한
             * 중복 저장을 막는 최종 방어선이다.
             */
            throw new ChatRoomConflictException(
                    "이미 존재하는 채팅방입니다.",
                    exception
            );
        }
    }

    private void validateRequest(
            Long loginUserId,
            Long friendUserId
    ) {
        if (
                friendUserId == null
                        || friendUserId < 1
        ) {
            throw new InvalidChatRoomRequestException(
                    "친구 사용자 번호가 올바르지 않습니다."
            );
        }

        if (
                loginUserId.equals(
                        friendUserId
                )
        ) {
            throw new InvalidChatRoomRequestException(
                    "자기 자신과 채팅방을 만들 수 없습니다."
            );
        }
    }
}
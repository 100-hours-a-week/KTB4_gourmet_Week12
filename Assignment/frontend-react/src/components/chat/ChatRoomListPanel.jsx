import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router";

import {
    getChatRooms
} from "../../api/chatApi.js";

import ChatRoomListItem
    from "./ChatRoomListItem.jsx";

import useAuth
    from "../../hooks/useAuth.js";

import useChat
    from "../../hooks/useChat.js";

function ChatRoomListPanel({
    activeRoomId
}) {
    const navigate =
        useNavigate();

    const {
        currentUser
    } = useAuth();

    const {
        isConnected,
        presenceByUserId,
        subscribeChatMessages,
        subscribeChatRead
    } = useChat();

    const [
        rooms,
        setRooms
    ] = useState([]);

    const [
        isLoading,
        setIsLoading
    ] = useState(true);

    const [
        errorMessage,
        setErrorMessage
    ] = useState("");

    useEffect(
        function () {
            const controller =
                new AbortController();

            let active = true;

            async function loadRooms() {
                setIsLoading(true);
                setErrorMessage("");

                try {
                    const response =
                        await getChatRooms({
                            page: 0,
                            size: 50,
                            signal:
                                controller.signal
                        });

                    if (
                        active
                        && !controller
                            .signal
                            .aborted
                    ) {
                        setRooms(
                            response?.content
                            ?? []
                        );
                    }
                } catch (error) {
                    if (
                        error?.name
                        !== "AbortError"
                        && active
                    ) {
                        setErrorMessage(
                            error?.message
                            ?? "채팅방 목록을 불러오지 못했습니다."
                        );
                    }
                } finally {
                    if (
                        active
                        && !controller
                            .signal
                            .aborted
                    ) {
                        setIsLoading(false);
                    }
                }
            }

            loadRooms();

            return function () {
                active = false;
                controller.abort();
            };
        },
        [
            isConnected
        ]
    );

    useEffect(
        function () {
            const unsubscribeMessage =
                subscribeChatMessages(
                    function (message) {
                        const roomId =
                            Number(
                                message?.roomId
                            );

                        setRooms(
                            function (previous) {
                                const roomIndex =
                                    previous
                                        .findIndex(
                                            function (room) {
                                                return Number(
                                                    room.roomId
                                                )
                                                    === roomId;
                                            }
                                        );

                                if (roomIndex < 0) {
                                    return previous;
                                }

                                const room =
                                    previous[
                                        roomIndex
                                    ];

                                const isMine =
                                    Number(
                                        message
                                            ?.senderId
                                    )
                                    === Number(
                                        currentUser
                                            ?.id
                                    );

                                const updatedRoom = {
                                    ...room,

                                    latestMessageId:
                                        message.messageId,

                                    latestMessageSequence:
                                        message.sequence,

                                    latestMessageSenderId:
                                        message.senderId,

                                    latestMessageContent:
                                        message.content,

                                    latestMessageCreatedAt:
                                        message.createdAt,

                                    unreadCount:
                                        isMine
                                            ? room.unreadCount
                                            : Number(
                                                room.unreadCount
                                                ?? 0
                                            ) + 1
                                };

                                return [
                                    updatedRoom,

                                    ...previous.filter(
                                        function (item) {
                                            return Number(
                                                item.roomId
                                            )
                                                !== roomId;
                                        }
                                    )
                                ];
                            }
                        );
                    }
                );

            const unsubscribeRead =
                subscribeChatRead(
                    function (event) {
                        if (
                            Number(
                                event?.readerId
                            )
                            !== Number(
                                currentUser?.id
                            )
                        ) {
                            return;
                        }

                        setRooms(
                            function (previous) {
                                return previous.map(
                                    function (room) {
                                        if (
                                            Number(
                                                room.roomId
                                            )
                                            !== Number(
                                                event.roomId
                                            )
                                        ) {
                                            return room;
                                        }

                                        return {
                                            ...room,
                                            unreadCount: 0
                                        };
                                    }
                                );
                            }
                        );
                    }
                );

            return function () {
                unsubscribeMessage();
                unsubscribeRead();
            };
        },
        [
            currentUser?.id,
            subscribeChatMessages,
            subscribeChatRead
        ]
    );

    function handleOpenRoom(
        room
    ) {
        navigate(
            `/chats/${room.roomId}`,
            {
                state: {
                    chatRoom: room
                }
            }
        );
    }

    return (
        <>
            {
                errorMessage && (
                    <p
                        className="chat-sidebar-error"
                        role="alert"
                    >
                        {errorMessage}
                    </p>
                )
            }

            {
                isLoading && (
                    <p className="chat-sidebar-state">
                        채팅방을 불러오는 중입니다.
                    </p>
                )
            }

            {
                !isLoading
                && rooms.length === 0
                && (
                    <div className="chat-sidebar-state">
                        <strong>
                            아직 채팅방이 없습니다.
                        </strong>

                        <span>
                            친구 목록에서 채팅을 시작해보세요.
                        </span>
                    </div>
                )
            }

            <ul className="chat-room-list">
                {
                    rooms.map(
                        function (room) {
                            return (
                                <ChatRoomListItem
                                    key={room.roomId}
                                    room={room}
                                    currentUserId={
                                        currentUser?.id
                                    }
                                    online={
                                        Boolean(
                                            presenceByUserId[
                                                room.friendUserId
                                            ]
                                        )
                                    }
                                    isActive={
                                        Number(
                                            room.roomId
                                        )
                                        === Number(
                                            activeRoomId
                                        )
                                    }
                                    onOpen={
                                        handleOpenRoom
                                    }
                                />
                            );
                        }
                    )
                }
            </ul>
        </>
    );
}

export default ChatRoomListPanel;

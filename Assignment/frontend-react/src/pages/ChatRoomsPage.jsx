import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router";

import {
    getChatRooms
} from "../api/chatApi.js";

import ChatRoomListItem
    from "../components/chat/ChatRoomListItem.jsx";

import useAuth
    from "../hooks/useAuth.js";

import useChat
    from "../hooks/useChat.js";

import "../styles/chat-list.css";

function ChatRoomsPage() {
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
            document.title =
                "채팅 · Gourmet Community";
        },
        []
    );

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
                                                room =>
                                                    Number(
                                                        room.roomId
                                                    )
                                                    === roomId
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
                                        item =>
                                            Number(
                                                item.roomId
                                            )
                                            !== roomId
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
        <section className="chat-list-page">
            <header className="chat-list-header">
                <p className="chat-eyebrow">
                    DIRECT MESSAGES
                </p>

                <h1>채팅</h1>

                <p>
                    친구들과 나눈 대화를 확인하세요.
                </p>
            </header>

            {
                errorMessage && (
                    <p
                        className="chat-page-error"
                        role="alert"
                    >
                        {errorMessage}
                    </p>
                )
            }

            {
                isLoading && (
                    <p className="chat-list-state">
                        채팅방을 불러오는 중입니다.
                    </p>
                )
            }

            {
                !isLoading
                && rooms.length === 0
                && (
                    <div className="chat-list-state">
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
                                    onOpen={
                                        handleOpenRoom
                                    }
                                />
                            );
                        }
                    )
                }
            </ul>
        </section>
    );
}

export default ChatRoomsPage;
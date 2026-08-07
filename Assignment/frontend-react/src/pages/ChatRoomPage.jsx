import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState
} from "react";

import {
    Link,
    useLocation,
    useParams
} from "react-router";

import {
    createClientMessageId
} from "../utils/clientMessageId.js";

import {
    resolveAssetUrl
} from "../utils/assetUrl.js";

import ChatMessageComposer
    from "../components/chat/ChatMessageComposer.jsx";

import ChatMessageList
    from "../components/chat/ChatMessageList.jsx";

import useAuth
    from "../hooks/useAuth.js";

import useChat
    from "../hooks/useChat.js";

import {
    getChatMessages,
    getChatRooms
} from "../api/chatApi.js";

import useChatRoomRealtime
    from "../hooks/useChatRoomRealtime.js";

import "../styles/chat.css";

const MESSAGE_PAGE_SIZE = 50;

function resolveRoomId(
    room
) {
    const roomId =
        Number(
            room?.roomId
            ?? room?.id
        );

    return Number.isInteger(roomId)
        && roomId > 0
        ? roomId
        : null;
}

function resolveFriendNickname(
    room
) {
    return (
        room?.friendNickname
        ?? room?.otherUserNickname
        ?? room?.nickname
        ?? "친구"
    );
}

function resolveFriendUserId(
    room
) {
    const userId =
        Number(
            room?.friendUserId
            ?? room?.otherUserId
            ?? room?.userId
        );

    return (
        Number.isInteger(userId)
        && userId > 0
    )
        ? userId
        : null;
}

function normalizeMessage(
    rawMessage
) {
    const messageId =
        Number(
            rawMessage?.messageId
            ?? rawMessage?.id
        );

    const roomId =
        Number(
            rawMessage?.roomId
        );

    const sequence =
        Number(
            rawMessage?.sequence
        );

    const senderId =
        Number(
            rawMessage?.senderId
        );

    return {
        ...rawMessage,

        messageId:
            Number.isInteger(messageId)
            && messageId > 0
                ? messageId
                : null,

        roomId:
            Number.isInteger(roomId)
            && roomId > 0
                ? roomId
                : null,

        sequence:
            Number.isInteger(sequence)
            && sequence > 0
                ? sequence
                : null,

        senderId:
            Number.isInteger(senderId)
            && senderId > 0
                ? senderId
                : null,

        senderNickname:
            rawMessage?.senderNickname
            ?? "알 수 없음",

        clientMessageId:
            rawMessage?.clientMessageId
            ?? null,

        content:
            String(
                rawMessage?.content
                ?? ""
            ),

        createdAt:
            rawMessage?.createdAt
            ?? new Date().toISOString(),

        pending:
            Boolean(
                rawMessage?.pending
            ),

        failed:
            Boolean(
                rawMessage?.failed
            )
    };
}

function compareMessages(
    first,
    second
) {
    const firstSequence =
        first.sequence
        ?? Number.MAX_SAFE_INTEGER;

    const secondSequence =
        second.sequence
        ?? Number.MAX_SAFE_INTEGER;

    if (
        firstSequence
        !== secondSequence
    ) {
        return (
            firstSequence
            - secondSequence
        );
    }

    return (
        new Date(first.createdAt)
            .getTime()
        - new Date(second.createdAt)
            .getTime()
    );
}

function mergeMessages(
    currentMessages,
    incomingMessages
) {
    const merged = [
        ...currentMessages
    ];

    incomingMessages.forEach(
        function (rawMessage) {
            const incoming =
                normalizeMessage(
                    rawMessage
                );

            const existingIndex =
                merged.findIndex(
                    function (existing) {
                        if (
                            incoming.messageId
                            && existing.messageId
                            === incoming.messageId
                        ) {
                            return true;
                        }

                        return (
                            incoming.clientMessageId
                            && existing.clientMessageId
                            === incoming.clientMessageId
                        );
                    }
                );

            if (existingIndex >= 0) {
                merged[existingIndex] = {
                    ...merged[existingIndex],
                    ...incoming,
                    pending: false,
                    failed: false
                };

                return;
            }

            merged.push(incoming);
        }
    );

    return merged.sort(
        compareMessages
    );
}

function findLatestSequence(
    messages
) {
    return messages.reduce(
        function (
            latestSequence,
            message
        ) {
            if (
                !Number.isInteger(
                    message.sequence
                )
            ) {
                return latestSequence;
            }

            return Math.max(
                latestSequence,
                message.sequence
            );
        },
        0
    );
}

function ChatRoomPage() {
    const {
        roomId: roomIdParam
    } = useParams();

    const location =
        useLocation();

    const {
        currentUser
    } = useAuth();

    const {
        isConnected,
        connectionError,
        lastChatError,
        clearChatError,
        sendMessage,
        markChatRoomRead,
        subscribeChatMessages
    } = useChat();

    const roomId =
        Number(roomIdParam);

    const messageContainerRef =
        useRef(null);

    const shouldScrollToBottomRef =
        useRef(true);

    const lastReadSentRef =
        useRef(0);

    const [
        roomInfo,
        setRoomInfo
    ] = useState(
        location.state?.chatRoom
        ?? null
    );

    const [
        messages,
        setMessages
    ] = useState([]);

    const [
        draft,
        setDraft
    ] = useState("");

    const [
        nextBeforeSequence,
        setNextBeforeSequence
    ] = useState(null);

    const [
        hasMore,
        setHasMore
    ] = useState(false);

    const [
        isInitialLoading,
        setIsInitialLoading
    ] = useState(true);

    const [
        isLoadingPrevious,
        setIsLoadingPrevious
    ] = useState(false);

    const [
        pageError,
        setPageError
    ] = useState("");

    const [
        sendError,
        setSendError
    ] = useState("");

    const friendNickname =
        resolveFriendNickname(
            roomInfo
        );

    const friendUserId =
        resolveFriendUserId(
            roomInfo
        );

    const friendProfileImage =
        resolveAssetUrl(
            roomInfo?.friendProfileImage
        );

    const {
        isFriendOnline,
        isOtherTyping,
        otherLastReadSequence,
        updateTyping,
        stopTyping,
        clearOtherTyping
    } = useChatRoomRealtime({
        roomId,
        currentUserId:
            currentUser?.id,
        friendUserId
    });

    const sendReadSequence =
        useCallback(
            function (sequence) {
                if (
                    !isConnected
                    || !Number.isInteger(
                        sequence
                    )
                    || sequence < 1
                    || sequence
                        <= lastReadSentRef.current
                ) {
                    return;
                }

                try {
                    markChatRoomRead(
                        roomId,
                        sequence
                    );

                    lastReadSentRef.current =
                        sequence;
                } catch (error) {
                    console.warn(
                        "채팅 읽음 처리 실패:",
                        error
                    );
                }
            },
            [
                isConnected,
                markChatRoomRead,
                roomId
            ]
        );

    useEffect(
        function () {
            document.title =
                `${friendNickname}님과의 채팅 · Gourmet Community`;
        },
        [
            friendNickname
        ]
    );

    useEffect(
        function () {
            lastReadSentRef.current = 0;
            clearChatError();
        },
        [
            clearChatError,
            roomId
        ]
    );

    /*
     * 새로고침이나 URL 직접 접근 시에는
     * location.state가 사라지므로
     * 채팅방 목록에서 현재 방 정보를 복구한다.
     */
    useEffect(
        function () {
            if (
                !Number.isInteger(roomId)
                || roomId < 1
                || resolveRoomId(roomInfo)
                    === roomId
            ) {
                return undefined;
            }

            const controller =
                new AbortController();

            async function loadRoomInfo() {
                try {
                    const response =
                        await getChatRooms({
                            page: 0,
                            size: 50,
                            signal:
                                controller.signal
                        });

                    const rooms =
                        response?.content
                        ?? [];

                    const foundRoom =
                        rooms.find(
                            function (room) {
                                return (
                                    resolveRoomId(room)
                                    === roomId
                                );
                            }
                        );

                    if (foundRoom) {
                        setRoomInfo(
                            foundRoom
                        );
                    }
                } catch (error) {
                    if (
                        error?.name
                        !== "AbortError"
                    ) {
                        console.error(
                            "채팅방 정보 복구 실패:",
                            error
                        );
                    }
                }
            }

            loadRoomInfo();

            return function () {
                controller.abort();
            };
        },
        [
            roomId,
            roomInfo
        ]
    );

    /*
     * 최근 메시지 최초 조회
     */
    useEffect(
        function () {
            if (
                !Number.isInteger(roomId)
                || roomId < 1
            ) {
                setIsInitialLoading(false);

                return undefined;
            }

            const controller =
                new AbortController();

            let active = true;

            async function loadInitialMessages() {
                setIsInitialLoading(true);
                setPageError("");

                try {
                    const response =
                        await getChatMessages(
                            roomId,
                            {
                                size:
                                    MESSAGE_PAGE_SIZE,
                                signal:
                                    controller.signal
                            }
                        );

                    if (
                        !active
                        || controller
                            .signal
                            .aborted
                    ) {
                        return;
                    }

                    shouldScrollToBottomRef
                        .current = true;

                    setMessages(
                        mergeMessages(
                            [],
                            response?.content
                            ?? []
                        )
                    );

                    setNextBeforeSequence(
                        response
                            ?.nextBeforeSequence
                        ?? null
                    );

                    setHasMore(
                        Boolean(
                            response?.hasMore
                        )
                    );
                } catch (error) {
                    if (
                        error?.name
                        === "AbortError"
                    ) {
                        return;
                    }

                    setPageError(
                        error?.message
                        ?? "메시지를 불러오지 못했습니다."
                    );
                } finally {
                    if (
                        active
                        && !controller
                            .signal
                            .aborted
                    ) {
                        setIsInitialLoading(
                            false
                        );
                    }
                }
            }

            loadInitialMessages();

            return function () {
                active = false;
                controller.abort();
            };
        },
        [
            roomId
        ]
    );

    /*
     * 실시간 메시지 수신
     */
    useEffect(
        function () {
            return subscribeChatMessages(
                function (receivedMessage) {
                    if (
                        Number(
                            receivedMessage?.roomId
                        ) !== roomId
                    ) {
                        return;
                    }

                    const normalizedMessage =
                        normalizeMessage(
                            receivedMessage
                        );

                    const container =
                        messageContainerRef
                            .current;

                    const isNearBottom =
                        !container
                        || (
                            container.scrollHeight
                            - container.scrollTop
                            - container.clientHeight
                            < 120
                        );

                    const isMyMessage =
                        normalizedMessage
                            .senderId
                        === Number(
                            currentUser?.id
                        );

                    if (!isMyMessage) {
                        clearOtherTyping();
                    }

                    if (
                        isNearBottom
                        || isMyMessage
                    ) {
                        shouldScrollToBottomRef
                            .current = true;
                    }

                    setMessages(
                        function (previous) {
                            return mergeMessages(
                                previous,
                                [
                                    normalizedMessage
                                ]
                            );
                        }
                    );

                    if (
                        document.visibilityState
                        === "visible"
                    ) {
                        sendReadSequence(
                            normalizedMessage
                                .sequence
                        );
                    }
                }
            );
        },
        [
            currentUser?.id,
            roomId,
            sendReadSequence,
            subscribeChatMessages,
            clearOtherTyping
        ]
    );

    /*
     * 최초 조회 또는 재연결 후
     * 현재 최신 메시지까지 읽음 처리한다.
     */
    useEffect(
        function () {
            if (
                document.visibilityState
                !== "visible"
            ) {
                return;
            }

            sendReadSequence(
                findLatestSequence(
                    messages
                )
            );
        },
        [
            isConnected,
            messages,
            sendReadSequence
        ]
    );

    useEffect(
        function () {
            function handleVisibilityChange() {
                if (
                    document.visibilityState
                    === "visible"
                ) {
                    sendReadSequence(
                        findLatestSequence(
                            messages
                        )
                    );
                }
            }

            document.addEventListener(
                "visibilitychange",
                handleVisibilityChange
            );

            return function () {
                document.removeEventListener(
                    "visibilitychange",
                    handleVisibilityChange
                );
            };
        },
        [
            messages,
            sendReadSequence
        ]
    );

    /*
     * 최초 조회, 새 메시지 전송 또는
     * 하단에서 실시간 메시지를 받은 경우
     * 메시지 영역을 맨 아래로 이동한다.
     */
    useLayoutEffect(
        function () {
            if (
                !shouldScrollToBottomRef
                    .current
            ) {
                return;
            }

            const container =
                messageContainerRef
                    .current;

            if (!container) {
                return;
            }

            container.scrollTop =
                container.scrollHeight;

            shouldScrollToBottomRef
                .current = false;
        },
        [
            messages
        ]
    );

    async function handleLoadPrevious() {
        if (
            isLoadingPrevious
            || !hasMore
            || !nextBeforeSequence
        ) {
            return;
        }

        const container =
            messageContainerRef.current;

        const previousScrollHeight =
            container?.scrollHeight
            ?? 0;

        const previousScrollTop =
            container?.scrollTop
            ?? 0;

        setIsLoadingPrevious(true);
        setPageError("");

        try {
            const response =
                await getChatMessages(
                    roomId,
                    {
                        beforeSequence:
                            nextBeforeSequence,

                        size:
                            MESSAGE_PAGE_SIZE
                    }
                );

            setMessages(
                function (previous) {
                    return mergeMessages(
                        previous,
                        response?.content
                        ?? []
                    );
                }
            );

            setNextBeforeSequence(
                response
                    ?.nextBeforeSequence
                ?? null
            );

            setHasMore(
                Boolean(
                    response?.hasMore
                )
            );

            /*
             * 이전 메시지가 위에 추가돼도
             * 사용자가 보고 있던 위치를 유지한다.
             */
            requestAnimationFrame(
                function () {
                    requestAnimationFrame(
                        function () {
                            if (!container) {
                                return;
                            }

                            const addedHeight =
                                container
                                    .scrollHeight
                                - previousScrollHeight;

                            container.scrollTop =
                                previousScrollTop
                                + addedHeight;
                        }
                    );
                }
            );
        } catch (error) {
            setPageError(
                error?.message
                ?? "이전 메시지를 불러오지 못했습니다."
            );
        } finally {
            setIsLoadingPrevious(false);
        }
    }

    function handleSendMessage() {
        const normalizedContent =
            draft.trim();

        if (!normalizedContent) {
            return;
        }

        if (!isConnected) {
            setSendError(
                "채팅 서버에 연결된 후 다시 시도해주세요."
            );

            return;
        }

        const clientMessageId =
            createClientMessageId();

        const pendingMessage = {
            messageId: null,
            roomId,
            sequence: null,
            senderId:
                Number(
                    currentUser?.id
                ),
            senderNickname:
                currentUser?.nickname
                ?? "나",
            clientMessageId,
            content:
                normalizedContent,
            createdAt:
                new Date()
                    .toISOString(),
            pending: true,
            failed: false
        };

        setSendError("");
        setDraft("");
        stopTyping();

        shouldScrollToBottomRef
            .current = true;

        setMessages(
            function (previous) {
                return mergeMessages(
                    previous,
                    [
                        pendingMessage
                    ]
                );
            }
        );

        try {
            sendMessage(
                roomId,
                normalizedContent,
                clientMessageId
            );
        } catch (error) {
            setMessages(
                function (previous) {
                    return previous.filter(
                        function (message) {
                            return (
                                message
                                    .clientMessageId
                                !== clientMessageId
                            );
                        }
                    );
                }
            );

            setDraft(
                normalizedContent
            );


            setSendError(
                error?.message
                ?? "메시지를 전송하지 못했습니다."
            );
        }
    }

    if (
        !Number.isInteger(roomId)
        || roomId < 1
    ) {
        return (
            <section className="chat-conversation">
                <div className="chat-state-card">
                    <h1>
                        채팅방을 찾을 수 없습니다.
                    </h1>

                    <Link to="/chats">
                        채팅 목록으로 돌아가기
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="chat-conversation">
            <header className="chat-conversation-header">
                <div className="chat-conversation-title">
                    <Link
                        to="/chats"
                        className="chat-back-button"
                        aria-label="채팅 목록으로"
                    >
                        ←
                    </Link>

                    <span className="chat-conversation-avatar">
                        {
                            friendProfileImage
                                ? (
                                    <img
                                        src={
                                            friendProfileImage
                                        }
                                        alt=""
                                    />
                                )
                                : (
                                    friendNickname
                                        .charAt(0)
                                        .toUpperCase()
                                )
                        }
                    </span>

                    <div>
                        <h1>
                            {friendNickname}
                        </h1>

                        <div
                            className={[
                                "chat-presence",

                                isFriendOnline === true
                                    ? "is-online"
                                    : "",

                                isFriendOnline === false
                                    ? "is-offline"
                                    : "",

                                isFriendOnline === null
                                    ? "is-unknown"
                                    : ""
                            ]
                                .filter(Boolean)
                                .join(" ")
                            }
                        >
                            <span aria-hidden="true" />

                            {
                                isFriendOnline === true
                                    ? "온라인"
                                    : isFriendOnline === false
                                        ? "오프라인"
                                        : "상태 확인 중"
                            }
                        </div>
                    </div>
                </div>

                <div className="chat-status-stack">
                    {
                        !isConnected && (
                            <span className="chat-reconnecting">
                                채팅 서버 재연결 중
                            </span>
                        )
                    }
                </div>
            </header>

            {
                (
                    pageError
                    || sendError
                    || connectionError
                    || lastChatError?.message
                )
                && (
                    <div
                        className="chat-page-error"
                        role="alert"
                    >
                        {
                            pageError
                            || sendError
                            || connectionError
                            || lastChatError?.message
                        }
                    </div>
                )
            }

            <div className="chat-room-panel">
                <ChatMessageList
                    messages={messages}
                    currentUserId={
                        currentUser?.id
                    }
                    otherLastReadSequence={
                        otherLastReadSequence
                    }
                    isInitialLoading={
                        isInitialLoading
                    }
                    isLoadingPrevious={
                        isLoadingPrevious
                    }
                    hasMore={hasMore}
                    onLoadPrevious={
                        handleLoadPrevious
                    }
                    containerRef={
                        messageContainerRef
                    }
                />

                <div className="chat-composer-area">
                    <p
                        className={[
                            "chat-typing-indicator",
                            isOtherTyping
                                ? "is-visible"
                                : ""
                        ]
                            .filter(Boolean)
                            .join(" ")
                        }
                        aria-live="polite"
                    >
                        {
                            isOtherTyping
                                ? `${friendNickname}님이 입력 중입니다...`
                                : "\u00A0"
                        }
                    </p>

                    <ChatMessageComposer
                        value={draft}
                        isConnected={
                            isConnected
                        }
                        onChange={
                            function (value) {
                                setDraft(value);
                                setSendError("");

                                updateTyping(value);
                            }
                        }
                        onSubmit={
                            handleSendMessage
                        }
                    />
                </div>
            </div>
        </section>
    );
}

export default ChatRoomPage;
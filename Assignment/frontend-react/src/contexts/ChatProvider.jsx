import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    Client
} from "@stomp/stompjs";

import {
    getChatPresence
} from "../api/chatApi.js";

import useAuth
    from "../hooks/useAuth.js";

import ChatContext
    from "./ChatContext.js";

const MESSAGE_DESTINATION =
    "/user/queue/chat/messages";

const READ_DESTINATION =
    "/user/queue/chat/read";

const TYPING_DESTINATION =
    "/user/queue/chat/typing";

const PRESENCE_DESTINATION =
    "/user/queue/chat/presence";

const ERROR_DESTINATION =
    "/user/queue/chat/errors";

function createListenerRegistry() {
    return {
        message: new Set(),
        read: new Set(),
        typing: new Set(),
        presence: new Set(),
        error: new Set()
    };
}

function createBrokerUrl() {
    const protocol =
        window.location.protocol === "https:"
            ? "wss:"
            : "ws:";

    return (
        `${protocol}//`
        + `${window.location.host}`
        + "/api/ws/chat"
    );
}

function parseJsonMessage(
    message,
    destination
) {
    if (!message?.body) {
        console.warn(
            `${destination}에서 빈 메시지를 받았습니다.`
        );

        return null;
    }

    try {
        return JSON.parse(
            message.body
        );
    } catch (error) {
        console.error(
            `${destination} 메시지 JSON 변환 실패:`,
            error
        );

        return null;
    }
}

function requirePositiveInteger(
    value,
    fieldName
) {
    const normalizedValue =
        Number(value);

    if (
        !Number.isInteger(
            normalizedValue
        )
        || normalizedValue < 1
    ) {
        throw new Error(
            `${fieldName}이 올바르지 않습니다.`
        );
    }

    return normalizedValue;
}

function requireNonNegativeInteger(
    value,
    fieldName
) {
    const normalizedValue =
        Number(value);

    if (
        !Number.isInteger(
            normalizedValue
        )
        || normalizedValue < 0
    ) {
        throw new Error(
            `${fieldName}이 올바르지 않습니다.`
        );
    }

    return normalizedValue;
}

function ChatProvider({
    children
}) {
    const {
        currentUser,
        isAuthenticated,
        isAuthLoading
    } = useAuth();

    const clientRef =
        useRef(null);

    /*
     * 오래된 WebSocket 클라이언트의 콜백이
     * 새 연결 상태를 덮어쓰지 못하도록
     * 연결 세대를 구분한다.
     */
    const connectionGenerationRef =
        useRef(0);

    const listenersRef =
        useRef(
            createListenerRegistry()
        );

    /*
     * 접속 상태 REST 응답보다 나중에 도착한
     * 실시간 Presence 이벤트가 과거 상태로
     * 덮어써지는 것을 막는다.
     */
    const presenceRevisionRef =
        useRef(0);

    const presenceRevisionByUserRef =
        useRef(new Map());

    const [
        isConnected,
        setIsConnected
    ] = useState(false);

    const [
        connectionError,
        setConnectionError
    ] = useState("");

    const [
        lastChatError,
        setLastChatError
    ] = useState(null);

    const [
        presenceByUserId,
        setPresenceByUserId
    ] = useState({});

    const emitEvent =
        useCallback(
            function (
                eventType,
                payload
            ) {
                const listeners =
                    listenersRef
                        .current[
                            eventType
                        ];

                if (!listeners) {
                    return;
                }

                /*
                 * 이벤트 처리 중 구독 해제가 일어나도
                 * 현재 순회가 깨지지 않도록 복사한다.
                 */
                Array.from(
                    listeners
                ).forEach(
                    function (listener) {
                        try {
                            listener(payload);
                        } catch (error) {
                            console.error(
                                `채팅 ${eventType} 이벤트 처리 실패:`,
                                error
                            );
                        }
                    }
                );
            },
            []
        );

    const registerListener =
        useCallback(
            function (
                eventType,
                listener
            ) {
                if (
                    typeof listener
                    !== "function"
                ) {
                    throw new Error(
                        "채팅 이벤트 리스너가 올바르지 않습니다."
                    );
                }

                const listeners =
                    listenersRef
                        .current[
                            eventType
                        ];

                if (!listeners) {
                    throw new Error(
                        "지원하지 않는 채팅 이벤트입니다."
                    );
                }

                listeners.add(
                    listener
                );

                return function unsubscribe() {
                    listeners.delete(
                        listener
                    );
                };
            },
            []
        );

    const handlePresenceEvent =
        useCallback(
            function (payload) {
                const userId =
                    Number(
                        payload?.userId
                    );

                if (
                    !Number.isInteger(
                        userId
                    )
                    || userId < 1
                    || typeof payload?.online
                        !== "boolean"
                ) {
                    console.warn(
                        "올바르지 않은 접속 상태 이벤트:",
                        payload
                    );

                    return;
                }

                presenceRevisionRef
                    .current += 1;

                presenceRevisionByUserRef
                    .current
                    .set(
                        userId,
                        presenceRevisionRef
                            .current
                    );

                setPresenceByUserId(
                    function (previous) {
                        return {
                            ...previous,
                            [userId]:
                                payload.online
                        };
                    }
                );

                emitEvent(
                    "presence",
                    {
                        userId,
                        online:
                            payload.online
                    }
                );
            },
            [
                emitEvent
            ]
        );

    const loadPresenceSnapshot =
        useCallback(
            async function ({
                signal
            } = {}) {
                /*
                 * 조회를 시작한 시점의 revision을
                 * 기록한다.
                 */
                const requestRevision =
                    presenceRevisionRef
                        .current;

                const response =
                    await getChatPresence({
                        signal
                    });

                const presenceItems =
                    Array.isArray(response)
                        ? response
                        : [];

                setPresenceByUserId(
                    function (previous) {
                        const next = {
                            ...previous
                        };

                        presenceItems.forEach(
                            function (item) {
                                const userId =
                                    Number(
                                        item?.userId
                                    );

                                if (
                                    !Number.isInteger(
                                        userId
                                    )
                                    || userId < 1
                                    || typeof item?.online
                                        !== "boolean"
                                ) {
                                    return;
                                }

                                /*
                                 * REST 요청 이후 해당 사용자의
                                 * 실시간 이벤트가 이미 도착했다면
                                 * REST의 오래된 상태로 덮지 않는다.
                                 */
                                const userRevision =
                                    presenceRevisionByUserRef
                                        .current
                                        .get(userId)
                                    ?? 0;

                                if (
                                    userRevision
                                    <= requestRevision
                                ) {
                                    next[userId] =
                                        item.online;
                                }
                            }
                        );

                        return next;
                    }
                );
            },
            []
        );

    useEffect(
        function () {
            if (
                isAuthLoading
                || !isAuthenticated
                || !currentUser?.id
            ) {
                clientRef.current =
                    null;

                setIsConnected(false);
                setConnectionError("");
                setLastChatError(null);
                setPresenceByUserId({});

                presenceRevisionRef
                    .current = 0;

                presenceRevisionByUserRef
                    .current
                    .clear();

                return undefined;
            }

            const generation =
                connectionGenerationRef
                    .current + 1;

            connectionGenerationRef
                .current =
                generation;

            let disposed = false;

            let subscriptions = [];

            const presenceController =
                new AbortController();

            const client =
                new Client({
                    brokerURL:
                        createBrokerUrl(),

                    /*
                     * 연결이 끊기면 3초 후
                     * 자동 재연결한다.
                     */
                    reconnectDelay: 3000,

                    heartbeatIncoming: 10000,
                    heartbeatOutgoing: 10000,

                    /*
                     * 운영 Console에 STOMP 프레임이나
                     * 쿠키 관련 정보를 출력하지 않는다.
                     */
                    debug: function () {
                    }
                });

            clientRef.current =
                client;

            function isCurrentConnection() {
                return (
                    !disposed
                    && connectionGenerationRef
                        .current
                        === generation
                );
            }

            function subscribeJson(
                destination,
                callback
            ) {
                return client.subscribe(
                    destination,
                    function (message) {
                        if (
                            !isCurrentConnection()
                        ) {
                            return;
                        }

                        const payload =
                            parseJsonMessage(
                                message,
                                destination
                            );

                        if (payload === null) {
                            return;
                        }

                        callback(payload);
                    }
                );
            }

            client.onConnect =
                function () {
                    if (
                        !isCurrentConnection()
                    ) {
                        return;
                    }

                    setIsConnected(true);
                    setConnectionError("");

                    /*
                     * onConnect는 최초 연결뿐 아니라
                     * 자동 재연결에도 실행된다.
                     *
                     * 따라서 사용자별 구독을 매번
                     * 다시 등록한다.
                     */
                    subscriptions = [
                        subscribeJson(
                            MESSAGE_DESTINATION,
                            function (payload) {
                                emitEvent(
                                    "message",
                                    payload
                                );
                            }
                        ),

                        subscribeJson(
                            READ_DESTINATION,
                            function (payload) {
                                emitEvent(
                                    "read",
                                    payload
                                );
                            }
                        ),

                        subscribeJson(
                            TYPING_DESTINATION,
                            function (payload) {
                                emitEvent(
                                    "typing",
                                    payload
                                );
                            }
                        ),

                        subscribeJson(
                            PRESENCE_DESTINATION,
                            handlePresenceEvent
                        ),

                        subscribeJson(
                            ERROR_DESTINATION,
                            function (payload) {
                                setLastChatError(
                                    payload
                                );

                                emitEvent(
                                    "error",
                                    payload
                                );
                            }
                        )
                    ];

                    loadPresenceSnapshot({
                        signal:
                            presenceController
                                .signal
                    }).catch(
                        function (error) {
                            if (
                                error?.name
                                === "AbortError"
                            ) {
                                return;
                            }

                            console.error(
                                "채팅 상대 접속 상태 조회 실패:",
                                error
                            );
                        }
                    );
                };

            client.onStompError =
                function (frame) {
                    if (
                        !isCurrentConnection()
                    ) {
                        return;
                    }

                    const message =
                        frame?.headers?.message
                        || "채팅 서버에서 STOMP 오류가 발생했습니다.";

                    setConnectionError(
                        message
                    );

                    console.error(
                        "STOMP 오류:",
                        frame
                    );
                };

            client.onWebSocketError =
                function (error) {
                    if (
                        !isCurrentConnection()
                    ) {
                        return;
                    }

                    setConnectionError(
                        "채팅 서버 연결 중 오류가 발생했습니다."
                    );

                    console.error(
                        "WebSocket 연결 오류:",
                        error
                    );
                };

            client.onWebSocketClose =
                function () {
                    if (
                        !isCurrentConnection()
                    ) {
                        return;
                    }

                    /*
                     * reconnectDelay가 설정돼 있으므로
                     * STOMP 클라이언트가 재연결을 시도한다.
                     */
                    setIsConnected(false);
                };

            client.activate();

            return function () {
                disposed = true;

                presenceController.abort();

                subscriptions.forEach(
                    function (subscription) {
                        try {
                            subscription
                                .unsubscribe();
                        } catch {
                            /*
                             * 이미 끊어진 세션의 구독은
                             * 별도 처리가 필요하지 않다.
                             */
                        }
                    }
                );

                subscriptions = [];

                if (
                    clientRef.current
                    === client
                ) {
                    clientRef.current =
                        null;
                }

                setIsConnected(false);

                /*
                 * 자동 재연결 예약도 함께 중단한다.
                 */
                void client.deactivate();
            };
        },
        [
            currentUser?.id,
            emitEvent,
            handlePresenceEvent,
            isAuthenticated,
            isAuthLoading,
            loadPresenceSnapshot
        ]
    );

    const publishJson =
        useCallback(
            function (
                destination,
                payload
            ) {
                const client =
                    clientRef.current;

                if (
                    !client
                    || !client.connected
                ) {
                    throw new Error(
                        "채팅 서버 연결이 완료되지 않았습니다."
                    );
                }

                client.publish({
                    destination,

                    headers: {
                        "content-type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )
                });
            },
            []
        );

    const sendMessage =
        useCallback(
            function (
                roomId,
                content,
                clientMessageId = null
            ) {
                const normalizedRoomId =
                    requirePositiveInteger(
                        roomId,
                        "채팅방 번호"
                    );

                const normalizedContent =
                    String(
                        content ?? ""
                    ).trim();

                if (!normalizedContent) {
                    throw new Error(
                        "메시지 내용을 입력해주세요."
                    );
                }

                if (
                    normalizedContent.length
                    > 2000
                ) {
                    throw new Error(
                        "메시지는 2000자 이하로 입력해주세요."
                    );
                }

                const normalizedClientMessageId =
                    clientMessageId
                    || crypto.randomUUID();

                publishJson(
                    `/app/chat/rooms/${normalizedRoomId}/messages`,
                    {
                        clientMessageId:
                            normalizedClientMessageId,

                        content:
                            normalizedContent
                    }
                );

                /*
                 * 화면에서 임시 메시지와 서버 응답을
                 * 연결할 수 있도록 UUID를 반환한다.
                 */
                return normalizedClientMessageId;
            },
            [
                publishJson
            ]
        );

    const markChatRoomRead =
        useCallback(
            function (
                roomId,
                lastReadSequence
            ) {
                const normalizedRoomId =
                    requirePositiveInteger(
                        roomId,
                        "채팅방 번호"
                    );

                const normalizedSequence =
                    requireNonNegativeInteger(
                        lastReadSequence,
                        "읽음 메시지 순서"
                    );

                publishJson(
                    `/app/chat/rooms/${normalizedRoomId}/read`,
                    {
                        lastReadSequence:
                            normalizedSequence
                    }
                );
            },
            [
                publishJson
            ]
        );

    const sendTyping =
        useCallback(
            function (
                roomId,
                typing
            ) {
                const normalizedRoomId =
                    requirePositiveInteger(
                        roomId,
                        "채팅방 번호"
                    );

                if (
                    typeof typing
                    !== "boolean"
                ) {
                    throw new Error(
                        "입력 상태가 올바르지 않습니다."
                    );
                }

                publishJson(
                    `/app/chat/rooms/${normalizedRoomId}/typing`,
                    {
                        typing
                    }
                );
            },
            [
                publishJson
            ]
        );

    const subscribeChatMessages =
        useCallback(
            function (listener) {
                return registerListener(
                    "message",
                    listener
                );
            },
            [
                registerListener
            ]
        );

    const subscribeChatRead =
        useCallback(
            function (listener) {
                return registerListener(
                    "read",
                    listener
                );
            },
            [
                registerListener
            ]
        );

    const subscribeChatTyping =
        useCallback(
            function (listener) {
                return registerListener(
                    "typing",
                    listener
                );
            },
            [
                registerListener
            ]
        );

    const subscribeChatPresence =
        useCallback(
            function (listener) {
                return registerListener(
                    "presence",
                    listener
                );
            },
            [
                registerListener
            ]
        );

    const subscribeChatErrors =
        useCallback(
            function (listener) {
                return registerListener(
                    "error",
                    listener
                );
            },
            [
                registerListener
            ]
        );

    const clearChatError =
        useCallback(
            function () {
                setLastChatError(null);
            },
            []
        );

    const value =
        useMemo(
            function () {
                return {
                    isConnected,
                    connectionError,
                    lastChatError,
                    presenceByUserId,

                    sendMessage,
                    markChatRoomRead,
                    sendTyping,

                    subscribeChatMessages,
                    subscribeChatRead,
                    subscribeChatTyping,
                    subscribeChatPresence,
                    subscribeChatErrors,

                    clearChatError,
                    refreshPresence:
                        loadPresenceSnapshot
                };
            },
            [
                clearChatError,
                connectionError,
                isConnected,
                lastChatError,
                loadPresenceSnapshot,
                markChatRoomRead,
                presenceByUserId,
                sendMessage,
                sendTyping,
                subscribeChatErrors,
                subscribeChatMessages,
                subscribeChatPresence,
                subscribeChatRead,
                subscribeChatTyping
            ]
        );

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}

export default ChatProvider;
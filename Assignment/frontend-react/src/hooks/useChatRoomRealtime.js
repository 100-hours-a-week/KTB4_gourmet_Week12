import {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";

import {
    getChatReadState
} from "../api/chatApi.js";

import useChat
    from "./useChat.js";

const LOCAL_TYPING_STOP_DELAY = 1500;
const REMOTE_TYPING_SAFETY_DELAY = 3000;

function toPositiveInteger(
    value
) {
    const number =
        Number(value);

    return (
        Number.isInteger(number)
        && number > 0
    )
        ? number
        : null;
}

function toNonNegativeInteger(
    value
) {
    const number =
        Number(value);

    return (
        Number.isInteger(number)
        && number >= 0
    )
        ? number
        : 0;
}

function useChatRoomRealtime({
    roomId,
    currentUserId,
    friendUserId
}) {
    const {
        isConnected,
        presenceByUserId,
        sendTyping,
        subscribeChatRead,
        subscribeChatTyping
    } = useChat();

    const localTypingTimerRef =
        useRef(null);

    const remoteTypingTimerRef =
        useRef(null);

    const isLocalTypingRef =
        useRef(false);

    const [
        resolvedFriendUserId,
        setResolvedFriendUserId
    ] = useState(
        toPositiveInteger(
            friendUserId
        )
    );

    const [
        otherLastReadSequence,
        setOtherLastReadSequence
    ] = useState(0);

    const [
        isOtherTyping,
        setIsOtherTyping
    ] = useState(false);

    const normalizedRoomId =
        toPositiveInteger(roomId);

    const normalizedCurrentUserId =
        toPositiveInteger(
            currentUserId
        );

    const effectiveFriendUserId =
        toPositiveInteger(
            friendUserId
        )
        ?? resolvedFriendUserId;

    useEffect(
        function () {
            setResolvedFriendUserId(
                toPositiveInteger(
                    friendUserId
                )
            );

            setOtherLastReadSequence(0);
            setIsOtherTyping(false);
        },
        [
            friendUserId,
            normalizedRoomId
        ]
    );

    /*
     * 새로고침 직후에도 기존 읽음 위치를
     * 복구하기 위한 REST 조회다.
     */
    useEffect(
        function () {
            if (!normalizedRoomId) {
                return undefined;
            }

            const controller =
                new AbortController();

            let active = true;

            async function loadReadState() {
                try {
                    const response =
                        await getChatReadState(
                            normalizedRoomId,
                            {
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

                    const otherUserId =
                        toPositiveInteger(
                            response?.otherUserId
                        );

                    if (otherUserId) {
                        setResolvedFriendUserId(
                            otherUserId
                        );
                    }

                    setOtherLastReadSequence(
                        toNonNegativeInteger(
                            response
                                ?.otherUserLastReadSequence
                        )
                    );
                } catch (error) {
                    if (
                        error?.name
                        !== "AbortError"
                    ) {
                        console.error(
                            "채팅 읽음 상태 조회 실패:",
                            error
                        );
                    }
                }
            }

            loadReadState();

            return function () {
                active = false;
                controller.abort();
            };
        },
        [
            normalizedRoomId
        ]
    );

    /*
     * 상대방이 읽음 위치를 변경했을 때
     * 현재 값보다 큰 sequence만 반영한다.
     */
    useEffect(
        function () {
            return subscribeChatRead(
                function (event) {
                    if (
                        Number(event?.roomId)
                        !== normalizedRoomId
                    ) {
                        return;
                    }

                    const readerId =
                        toPositiveInteger(
                            event?.readerId
                        );

                    if (
                        !readerId
                        || readerId
                        === normalizedCurrentUserId
                    ) {
                        return;
                    }

                    setResolvedFriendUserId(
                        readerId
                    );

                    const sequence =
                        toNonNegativeInteger(
                            event?.lastReadSequence
                        );

                    setOtherLastReadSequence(
                        function (previous) {
                            return Math.max(
                                previous,
                                sequence
                            );
                        }
                    );
                }
            );
        },
        [
            normalizedCurrentUserId,
            normalizedRoomId,
            subscribeChatRead
        ]
    );

    const clearOtherTyping =
        useCallback(
            function () {
                if (
                    remoteTypingTimerRef
                        .current
                ) {
                    clearTimeout(
                        remoteTypingTimerRef
                            .current
                    );

                    remoteTypingTimerRef
                        .current = null;
                }

                setIsOtherTyping(false);
            },
            []
        );

    /*
     * 입력 종료 이벤트가 네트워크 문제로 유실돼도
     * 3초 후 화면에서 자동으로 제거한다.
     */
    useEffect(
        function () {
            const unsubscribe =
                subscribeChatTyping(
                    function (event) {
                        if (
                            Number(event?.roomId)
                            !== normalizedRoomId
                        ) {
                            return;
                        }

                        const typingUserId =
                            toPositiveInteger(
                                event?.userId
                            );

                        if (
                            !typingUserId
                            || typingUserId
                            === normalizedCurrentUserId
                        ) {
                            return;
                        }

                        setResolvedFriendUserId(
                            typingUserId
                        );

                        if (!event?.typing) {
                            clearOtherTyping();
                            return;
                        }

                        setIsOtherTyping(true);

                        if (
                            remoteTypingTimerRef
                                .current
                        ) {
                            clearTimeout(
                                remoteTypingTimerRef
                                    .current
                            );
                        }

                        remoteTypingTimerRef.current =
                            setTimeout(
                                function () {
                                    setIsOtherTyping(
                                        false
                                    );

                                    remoteTypingTimerRef
                                        .current = null;
                                },
                                REMOTE_TYPING_SAFETY_DELAY
                            );
                    }
                );

            return function () {
                unsubscribe();
                clearOtherTyping();
            };
        },
        [
            clearOtherTyping,
            normalizedCurrentUserId,
            normalizedRoomId,
            subscribeChatTyping
        ]
    );

    const stopTyping =
        useCallback(
            function () {
                if (
                    localTypingTimerRef
                        .current
                ) {
                    clearTimeout(
                        localTypingTimerRef
                            .current
                    );

                    localTypingTimerRef
                        .current = null;
                }

                if (
                    !isLocalTypingRef
                        .current
                ) {
                    return;
                }

                isLocalTypingRef.current =
                    false;

                if (!normalizedRoomId) {
                    return;
                }

                try {
                    sendTyping(
                        normalizedRoomId,
                        false
                    );
                } catch {
                    /*
                     * 연결 종료 중에는 typing=false를
                     * 전송하지 못할 수 있다.
                     *
                     * 상대 화면의 안전 타이머가
                     * 입력 중 표시를 제거한다.
                     */
                }
            },
            [
                normalizedRoomId,
                sendTyping
            ]
        );

    const updateTyping =
        useCallback(
            function (value) {
                const hasContent =
                    String(
                        value ?? ""
                    ).trim().length > 0;

                if (
                    !hasContent
                    || !isConnected
                    || !normalizedRoomId
                ) {
                    stopTyping();
                    return;
                }

                if (
                    !isLocalTypingRef
                        .current
                ) {
                    try {
                        sendTyping(
                            normalizedRoomId,
                            true
                        );

                        isLocalTypingRef.current =
                            true;
                    } catch {
                        return;
                    }
                }

                if (
                    localTypingTimerRef
                        .current
                ) {
                    clearTimeout(
                        localTypingTimerRef
                            .current
                    );
                }

                localTypingTimerRef.current =
                    setTimeout(
                        stopTyping,
                        LOCAL_TYPING_STOP_DELAY
                    );
            },
            [
                isConnected,
                normalizedRoomId,
                sendTyping,
                stopTyping
            ]
        );

    useEffect(
        function () {
            return function () {
                stopTyping();

                if (
                    remoteTypingTimerRef
                        .current
                ) {
                    clearTimeout(
                        remoteTypingTimerRef
                            .current
                    );
                }
            };
        },
        [
            stopTyping
        ]
    );

    const hasPresenceState =
        effectiveFriendUserId !== null
        && Object.prototype.hasOwnProperty.call(
            presenceByUserId,
            effectiveFriendUserId
        );

    const isFriendOnline =
        hasPresenceState
            ? Boolean(
                presenceByUserId[
                    effectiveFriendUserId
                ]
            )
            : null;

    return {
        friendUserId:
            effectiveFriendUserId,

        isFriendOnline,
        isOtherTyping,
        otherLastReadSequence,

        updateTyping,
        stopTyping,
        clearOtherTyping
    };
}

export default useChatRoomRealtime;
import {
    useEffect,
    useState
} from "react";

import {
    getChatUnreadCount
} from "../api/chatApi.js";

import useChat
    from "./useChat.js";

function useChatUnreadCount() {
    const {
        isConnected,
        subscribeChatMessages,
        subscribeChatRead
    } = useChat();

    const [
        unreadCount,
        setUnreadCount
    ] = useState(0);

    useEffect(
        function () {
            let active = true;
            let refreshTimer = null;

            async function refreshUnreadCount() {
                try {
                    const response =
                        await getChatUnreadCount();

                    if (active) {
                        setUnreadCount(
                            Math.max(
                                Number(
                                    response
                                        ?.unreadCount
                                    ?? 0
                                ),
                                0
                            )
                        );
                    }
                } catch (error) {
                    if (active) {
                        console.error(
                            "읽지 않은 채팅 개수 조회 실패:",
                            error
                        );
                    }
                }
            }

            function scheduleRefresh() {
                if (refreshTimer) {
                    clearTimeout(
                        refreshTimer
                    );
                }

                refreshTimer =
                    setTimeout(
                        refreshUnreadCount,
                        80
                    );
            }

            const unsubscribeMessage =
                subscribeChatMessages(
                    scheduleRefresh
                );

            const unsubscribeRead =
                subscribeChatRead(
                    scheduleRefresh
                );

            refreshUnreadCount();

            return function () {
                active = false;

                unsubscribeMessage();
                unsubscribeRead();

                if (refreshTimer) {
                    clearTimeout(
                        refreshTimer
                    );
                }
            };
        },
        [
            isConnected,
            subscribeChatMessages,
            subscribeChatRead
        ]
    );

    return unreadCount;
}

export default useChatUnreadCount;
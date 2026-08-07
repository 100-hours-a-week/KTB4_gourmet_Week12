import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    useNavigate
} from "react-router";

import {
    getNotifications,
    getUnreadNotificationCount,
    markAllNotificationsAsRead,
    markNotificationAsRead
} from "../../api/notificationApi.js";

import {
    publishFriendDataChanged
} from "../../events/friendEvents.js";

import NotificationItem
    from "./NotificationItem.jsx";

import "../../styles/header-actions.css";
import "../../styles/notification.css";

const NOTIFICATION_PAGE_SIZE = 10;

const POST_NOTIFICATION_TYPES =
    new Set([
        "COMMENT_CREATED",
        "POST_LIKED"
    ]);

const FRIEND_NOTIFICATION_TYPES =
    new Set([
        "FRIEND_REQUESTED",
        "FRIEND_ACCEPTED"
    ]);

function NotificationBell() {
    const navigate = useNavigate();

    const wrapperRef = useRef(null);

    const receivedIdsRef =
        useRef(new Set());

    const removedIdsRef =
        useRef(new Set());

    const [
        isOpen,
        setIsOpen
    ] = useState(false);

    const [
        notifications,
        setNotifications
    ] = useState([]);

    const [
        unreadCount,
        setUnreadCount
    ] = useState(0);

    const [
        page,
        setPage
    ] = useState(0);

    const [
        isLastPage,
        setIsLastPage
    ] = useState(true);

    const [
        isLoading,
        setIsLoading
    ] = useState(false);

    const [
        errorMessage,
        setErrorMessage
    ] = useState("");

    const [
        isMarkingAllAsRead,
        setIsMarkingAllAsRead
    ] = useState(false);

    async function refreshUnreadCount() {
        const response =
            await getUnreadNotificationCount();

        setUnreadCount(
            response.unreadCount ?? 0
        );
    }

    function removeNotificationLocally(
        notificationId
    ) {
        removedIdsRef.current.add(
            notificationId
        );

        receivedIdsRef.current.delete(
            notificationId
        );

        setNotifications(
            function (previous) {
                return previous.filter(
                    function (notification) {
                        return (
                            notification.id
                            !== notificationId
                        );
                    }
                );
            }
        );
    }

    useEffect(function () {
        let ignore = false;

        async function loadUnreadCount() {
            try {
                const response =
                    await getUnreadNotificationCount();

                if (!ignore) {
                    setUnreadCount(
                        response.unreadCount ?? 0
                    );
                }
            } catch (error) {
                if (!ignore) {
                    console.error(
                        "읽지 않은 알림 개수 조회 실패:",
                        error
                    );
                }
            }
        }

        loadUnreadCount();

        return function () {
            ignore = true;
        };
    }, []);

    useEffect(function () {
        const eventSource =
            new EventSource(
                "/api/notifications/subscribe",
                {
                    withCredentials: true
                }
            );

        async function handleConnected() {
            try {
                await refreshUnreadCount();
            } catch (error) {
                console.error(
                    "SSE 재연결 후 알림 개수 조회 실패:",
                    error
                );
            }
        }

        async function handleNotificationRemoved(
            event
        ) {
            try {
                const response =
                    JSON.parse(event.data);

                removeNotificationLocally(
                    response.notificationId
                );

                /*
                 * 요청 취소·거절 등으로 친구 요청 알림이
                 * 제거됐을 수도 있으므로 친구 페이지가
                 * 열려 있다면 서버 상태를 다시 조회한다.
                 */
                publishFriendDataChanged({
                    reason:
                        "notification-removed",
                    notificationId:
                        response.notificationId
                });

                await refreshUnreadCount();
            } catch (error) {
                console.error(
                    "삭제된 알림 처리 실패:",
                    error
                );
            }
        }

        function handleNotificationsReadAll() {
            setNotifications(
                function (previous) {
                    return previous.map(
                        function (notification) {
                            return {
                                ...notification,
                                read: true
                            };
                        }
                    );
                }
            );

            setUnreadCount(0);
        }

        function handleNotification(event) {
            try {
                const notification =
                    JSON.parse(event.data);

                if (
                    removedIdsRef.current.has(
                        notification.id
                    )
                ) {
                    return;
                }

                if (
                    receivedIdsRef.current.has(
                        notification.id
                    )
                ) {
                    return;
                }

                receivedIdsRef.current.add(
                    notification.id
                );

                setNotifications(
                    function (previous) {
                        return [
                            notification,
                            ...previous.filter(
                                function (item) {
                                    return (
                                        item.id
                                        !== notification.id
                                    );
                                }
                            )
                        ].sort(
                            function (first, second) {
                                return (
                                    second.id
                                    - first.id
                                );
                            }
                        );
                    }
                );

                setUnreadCount(
                    function (previous) {
                        return previous + 1;
                    }
                );

                /*
                 * 친구 요청 도착 또는 친구 수락 알림이면
                 * /friends 화면에 변경 사실을 전달한다.
                 */
                if (
                    FRIEND_NOTIFICATION_TYPES.has(
                        notification.type
                    )
                ) {
                    publishFriendDataChanged({
                        reason:
                            "friend-notification",
                        notificationType:
                            notification.type,
                        friendRequestId:
                            notification.friendRequestId,
                        senderId:
                            notification.senderId
                    });
                }
            } catch (error) {
                console.error(
                    "실시간 알림 처리 실패:",
                    error
                );
            }
        }

        eventSource.addEventListener(
            "connected",
            handleConnected
        );

        eventSource.addEventListener(
            "notification",
            handleNotification
        );

        eventSource.addEventListener(
            "notification-removed",
            handleNotificationRemoved
        );

        eventSource.addEventListener(
            "notifications-read-all",
            handleNotificationsReadAll
        );

        eventSource.onerror =
            function (error) {
                console.warn(
                    "SSE 연결이 끊어졌습니다. 자동 재연결을 기다립니다.",
                    error
                );
            };

        return function () {
            eventSource.removeEventListener(
                "connected",
                handleConnected
            );

            eventSource.removeEventListener(
                "notification",
                handleNotification
            );

            eventSource.removeEventListener(
                "notification-removed",
                handleNotificationRemoved
            );

            eventSource.removeEventListener(
                "notifications-read-all",
                handleNotificationsReadAll
            );

            eventSource.close();
        };
    }, []);

    useEffect(function () {
        function handleOutsideClick(event) {
            if (
                wrapperRef.current
                && !wrapperRef.current.contains(
                    event.target
                )
            ) {
                setIsOpen(false);
            }
        }

        function handleEscapeKey(event) {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        }

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        document.addEventListener(
            "keydown",
            handleEscapeKey
        );

        return function () {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );

            document.removeEventListener(
                "keydown",
                handleEscapeKey
            );
        };
    }, []);

    async function loadNotifications({
        targetPage,
        append
    }) {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const response =
                await getNotifications({
                    page: targetPage,
                    size: NOTIFICATION_PAGE_SIZE
                });

            const receivedNotifications =
                response.notifications ?? [];

            receivedNotifications.forEach(
                function (notification) {
                    receivedIdsRef.current.add(
                        notification.id
                    );
                }
            );

            setNotifications(
                function (previous) {
                    if (!append) {
                        return receivedNotifications;
                    }

                    const merged = [
                        ...previous,
                        ...receivedNotifications
                    ];

                    return Array.from(
                        new Map(
                            merged.map(
                                function (item) {
                                    return [
                                        item.id,
                                        item
                                    ];
                                }
                            )
                        ).values()
                    ).sort(
                        function (first, second) {
                            return (
                                second.id
                                - first.id
                            );
                        }
                    );
                }
            );

            setPage(
                response.page
                ?? targetPage
            );

            setIsLastPage(
                response.last
                ?? true
            );
        } catch (error) {
            setErrorMessage(
                error?.message
                ?? "알림 목록을 불러오지 못했습니다."
            );
        } finally {
            setIsLoading(false);
        }
    }

    async function handleBellClick() {
        const nextOpenState =
            !isOpen;

        setIsOpen(nextOpenState);

        if (!nextOpenState) {
            return;
        }

        await Promise.all([
            loadNotifications({
                targetPage: 0,
                append: false
            }),

            refreshUnreadCount()
        ]);
    }

    async function handleMarkAllAsRead() {
        if (
            unreadCount === 0
            || isMarkingAllAsRead
        ) {
            return;
        }

        setIsMarkingAllAsRead(true);
        setErrorMessage("");

        try {
            await markAllNotificationsAsRead();

            setNotifications(
                function (previous) {
                    return previous.map(
                        function (notification) {
                            return {
                                ...notification,
                                read: true
                            };
                        }
                    );
                }
            );

            setUnreadCount(0);
        } catch (error) {
            setErrorMessage(
                error?.message
                ?? "모든 알림을 읽음 처리하지 못했습니다."
            );
        } finally {
            setIsMarkingAllAsRead(false);
        }
    }

    async function markNotificationReadLocally(
        notification
    ) {
        if (notification.read) {
            return;
        }

        await markNotificationAsRead(
            notification.id
        );

        setNotifications(
            function (previous) {
                return previous.map(
                    function (item) {
                        if (
                            item.id
                            !== notification.id
                        ) {
                            return item;
                        }

                        return {
                            ...item,
                            read: true
                        };
                    }
                );
            }
        );

        setUnreadCount(
            function (previous) {
                return Math.max(
                    0,
                    previous - 1
                );
            }
        );
    }

    async function handleNotificationClick(
        notification
    ) {
        try {
            await markNotificationReadLocally(
                notification
            );

            if (
                POST_NOTIFICATION_TYPES.has(
                    notification.type
                )
                && notification.postId
            ) {
                setIsOpen(false);

                navigate(
                    `/posts/${notification.postId}`,
                    {
                        state: {
                            commentId:
                                notification.commentId
                        }
                    }
                );

                return;
            }

            /*
             * 친구 요청 알림과 친구 수락 알림 모두
             * 클릭하면 친구 관리 페이지로 이동한다.
             */
            if (
                FRIEND_NOTIFICATION_TYPES.has(
                    notification.type
                )
            ) {
                setIsOpen(false);

                navigate("/friends");

                return;
            }
        } catch (error) {
            setErrorMessage(
                error?.message
                ?? "알림을 읽음 처리하지 못했습니다."
            );
        }
    }

    async function handleFriendRequestProcessed(
        notificationId,
        action
    ) {
        removeNotificationLocally(
            notificationId
        );

        /*
         * 알림창에서 직접 수락·거절한 경우
         * 열려 있는 친구 페이지를 즉시 갱신한다.
         */
        publishFriendDataChanged({
            reason:
                "friend-request-processed",
            notificationId,
            action
        });

        try {
            await refreshUnreadCount();
        } catch (error) {
            console.error(
                "친구 요청 처리 후 알림 개수 동기화 실패:",
                error
            );
        }
    }

    async function handleLoadMore() {
        await loadNotifications({
            targetPage: page + 1,
            append: true
        });
    }

    return (
        <div
            className="notification-wrapper"
            ref={wrapperRef}
        >
            <button
                type="button"
                className={
                    `header-action-button notification-button ${
                        isOpen
                            ? "is-open"
                            : ""
                    }`
                }
                aria-label="알림 확인"
                aria-expanded={isOpen}
                onClick={handleBellClick}
            >
                <svg
                    className="header-action-icon notification-icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    fill="currentColor"
                >
                    <path d="M12 2.6c-.9 0-1.65.7-1.65 1.55v.35C7.7 5 6.1 7.15 6.1 9.7v4.15l-1.7 2.35c-.35.5 0 1.2.6 1.2h14c.6 0 .95-.7.6-1.2l-1.7-2.35V9.7c0-2.55-1.6-4.7-4.25-5.2v-.35C13.65 3.3 12.9 2.6 12 2.6z" />
                    <path d="M10.15 19.55c.35.95 1.25 1.6 2.25 1.6s1.9-.65 2.25-1.6z" />
                </svg>

                {
                    unreadCount > 0 && (
                        <span
                            className={
                                "header-action-badge notification-badge"
                            }
                            aria-label={
                                `읽지 않은 알림 ${unreadCount}개`
                            }
                        >
                            {
                                unreadCount > 99
                                    ? "99+"
                                    : unreadCount
                            }
                        </span>
                    )
                }
            </button>

            {
                isOpen && (
                    <section
                        className="notification-panel"
                        aria-label="알림 목록"
                    >
                        <div
                            className={
                                "notification-panel-header"
                            }
                        >
                            <h2>알림</h2>

                            <div
                                className={
                                    "notification-panel-actions"
                                }
                            >
                                <span>
                                    읽지 않음 {unreadCount}
                                </span>

                                <button
                                    type="button"
                                    className={
                                        "notification-read-all-button"
                                    }
                                    disabled={
                                        unreadCount === 0
                                        || isMarkingAllAsRead
                                    }
                                    onClick={
                                        handleMarkAllAsRead
                                    }
                                >
                                    {
                                        isMarkingAllAsRead
                                            ? "처리 중"
                                            : "모두 읽음"
                                    }
                                </button>
                            </div>
                        </div>

                        {
                            errorMessage && (
                                <p
                                    className={
                                        "notification-error"
                                    }
                                >
                                    {errorMessage}
                                </p>
                            )
                        }

                        {
                            !isLoading
                            && notifications.length === 0
                            && !errorMessage
                            && (
                                <p
                                    className={
                                        "notification-empty"
                                    }
                                >
                                    아직 도착한 알림이 없습니다.
                                </p>
                            )
                        }

                        <ul
                            className="notification-list"
                        >
                            {
                                notifications.map(
                                    function (notification) {
                                        return (
                                            <NotificationItem
                                                key={
                                                    notification.id
                                                }
                                                notification={
                                                    notification
                                                }
                                                onNotificationClick={
                                                    handleNotificationClick
                                                }
                                                onFriendRequestProcessed={
                                                    handleFriendRequestProcessed
                                                }
                                            />
                                        );
                                    }
                                )
                            }
                        </ul>

                        {
                            isLoading && (
                                <p
                                    className={
                                        "notification-loading"
                                    }
                                >
                                    알림을 불러오는 중입니다.
                                </p>
                            )
                        }

                        {
                            !isLastPage
                            && !isLoading
                            && (
                                <button
                                    type="button"
                                    className={
                                        "notification-more-button"
                                    }
                                    onClick={
                                        handleLoadMore
                                    }
                                >
                                    알림 더 보기
                                </button>
                            )
                        }
                    </section>
                )
            }
        </div>
    );
}

export default NotificationBell;
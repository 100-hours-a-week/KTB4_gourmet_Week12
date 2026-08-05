import FriendRequestNotificationActions
    from "./FriendRequestNotificationActions.jsx";

function formatRelativeTime(createdAt) {
    if (!createdAt) {
        return "";
    }

    const createdTime =
        new Date(createdAt).getTime();

    const differenceSeconds =
        Math.max(
            0,
            Math.floor(
                (
                    Date.now()
                    - createdTime
                ) / 1000
            )
        );

    if (differenceSeconds < 60) {
        return "방금 전";
    }

    const differenceMinutes =
        Math.floor(
            differenceSeconds / 60
        );

    if (differenceMinutes < 60) {
        return `${differenceMinutes}분 전`;
    }

    const differenceHours =
        Math.floor(
            differenceMinutes / 60
        );

    if (differenceHours < 24) {
        return `${differenceHours}시간 전`;
    }

    const differenceDays =
        Math.floor(
            differenceHours / 24
        );

    if (differenceDays < 7) {
        return `${differenceDays}일 전`;
    }

    return new Intl.DateTimeFormat(
        "ko-KR",
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }
    ).format(
        new Date(createdAt)
    );
}

function NotificationItem({
    notification,
    onNotificationClick,
    onFriendRequestProcessed
}) {
    const isFriendRequest =
        notification.type
        === "FRIEND_REQUESTED";

    const hasValidFriendRequest =
        isFriendRequest
        && Boolean(
            notification.friendRequestId
        );

    return (
        <li>
            <div
                className={[
                    "notification-entry",
                    notification.read
                        ? "is-read"
                        : "is-unread"
                ].join(" ")}
            >
                <button
                    type="button"
                    className="notification-item"
                    onClick={function () {
                        onNotificationClick(
                            notification
                        );
                    }}
                >
                    <span
                        className={
                            "notification-item-marker"
                        }
                        aria-hidden="true"
                    />

                    <span
                        className={
                            "notification-item-content"
                        }
                    >
                        <strong>
                            {notification.message}
                        </strong>

                        <time
                            dateTime={
                                notification.createdAt
                            }
                        >
                            {
                                formatRelativeTime(
                                    notification.createdAt
                                )
                            }
                        </time>
                    </span>
                </button>

                {
                    hasValidFriendRequest && (
                        <FriendRequestNotificationActions
                            friendRequestId={
                                notification.friendRequestId
                            }
                            notificationId={
                                notification.id
                            }
                            onProcessed={
                                onFriendRequestProcessed
                            }
                        />
                    )
                }
            </div>
        </li>
    );
}

export default NotificationItem;
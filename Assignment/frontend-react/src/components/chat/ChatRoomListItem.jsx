import {
    resolveAssetUrl
} from "../../utils/assetUrl.js";

function formatRoomTime(
    createdAt
) {
    if (!createdAt) {
        return "";
    }

    const date =
        new Date(createdAt);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    const today =
        new Date();

    const isToday =
        date.toDateString()
        === today.toDateString();

    return new Intl.DateTimeFormat(
        "ko-KR",
        isToday
            ? {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            }
            : {
                month: "2-digit",
                day: "2-digit"
            }
    ).format(date);
}

function ChatRoomListItem({
    room,
    currentUserId,
    online,
    isActive,
    onOpen
}) {
    const profileImage =
        resolveAssetUrl(
            room.friendProfileImage
        );

    const latestMessage =
        room.latestMessageContent
        ?? "아직 대화가 없습니다.";

    const isMyLatestMessage =
        Number(
            room.latestMessageSenderId
        )
        === Number(currentUserId);

    return (
        <li>
            <button
                type="button"
                className={[
                    "chat-room-list-item",
                    isActive
                        ? "is-active"
                        : ""
                ]
                    .filter(Boolean)
                    .join(" ")}
                aria-current={
                    isActive
                        ? "true"
                        : undefined
                }
                onClick={
                    function () {
                        onOpen(room);
                    }
                }
            >
                <span className="chat-room-avatar">
                    {
                        profileImage
                            ? (
                                <img
                                    src={profileImage}
                                    alt=""
                                />
                            )
                            : (
                                room.friendNickname
                                    ?.charAt(0)
                                    .toUpperCase()
                                ?? "?"
                            )
                    }

                    <span
                        className={
                            online
                                ? "chat-room-online-dot is-online"
                                : "chat-room-online-dot"
                        }
                        aria-hidden="true"
                    />
                </span>

                <span className="chat-room-copy">
                    <strong>
                        {room.friendNickname}
                    </strong>

                    <span>
                        {
                            isMyLatestMessage
                                ? `나: ${latestMessage}`
                                : latestMessage
                        }
                    </span>
                </span>

                <span className="chat-room-side">
                    <time>
                        {
                            formatRoomTime(
                                room.latestMessageCreatedAt
                                ?? room.updatedAt
                                ?? room.createdAt
                            )
                        }
                    </time>

                    {
                        Number(
                            room.unreadCount
                        ) > 0 && (
                            <span className="chat-room-unread">
                                {
                                    room.unreadCount > 99
                                        ? "99+"
                                        : room.unreadCount
                                }
                            </span>
                        )
                    }
                </span>
            </button>
        </li>
    );
}

export default ChatRoomListItem;
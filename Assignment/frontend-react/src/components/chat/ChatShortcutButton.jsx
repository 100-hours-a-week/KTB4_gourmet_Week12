import {
    NavLink
} from "react-router";

import useChatUnreadCount
    from "../../hooks/useChatUnreadCount.js";

import "../../styles/chat-shortcut.css";

function ChatShortcutButton() {
    const unreadCount =
        useChatUnreadCount();

    return (
        <NavLink
            to="/chats"
            className={function ({
                isActive
            }) {
                return [
                    "chat-shortcut-button",
                    isActive
                        ? "is-active"
                        : ""
                ]
                    .filter(Boolean)
                    .join(" ");
            }}
            aria-label={
                unreadCount > 0
                    ? `채팅, 읽지 않은 메시지 ${unreadCount}개`
                    : "채팅"
            }
            title="채팅"
        >
            <svg
                className="chat-shortcut-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    d="
                        M4 5.5
                        C4 4.1 5.1 3 6.5 3
                        H17.5
                        C18.9 3 20 4.1 20 5.5
                        V14.5
                        C20 15.9 18.9 17 17.5 17
                        H10
                        L5 21
                        V17
                        C4.4 16.5 4 15.6 4 14.5
                        Z
                    "
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>

            {
                unreadCount > 0 && (
                    <span
                        className={
                            "chat-shortcut-badge"
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
        </NavLink>
    );
}

export default ChatShortcutButton;
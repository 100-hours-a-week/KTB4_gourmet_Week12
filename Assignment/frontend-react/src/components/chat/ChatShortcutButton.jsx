import {
    NavLink
} from "react-router";

import useChatUnreadCount
    from "../../hooks/useChatUnreadCount.js";

import "../../styles/header-actions.css";

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
                    "header-action-button",
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
                className="header-action-icon chat-shortcut-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="currentColor"
            >
                <path
                    fillRule="evenodd"
                    d="
                        M5.1 4
                        H18.9
                        C20.5 4 21.8 5.3 21.8 6.9
                        V14
                        C21.8 15.6 20.5 16.9 18.9 16.9
                        H11.1
                        L7.2 20.2
                        C6.65 20.7 5.8 20.3 5.8 19.55
                        V16.9
                        H5.1
                        C3.5 16.9 2.2 15.6 2.2 14
                        V6.9
                        C2.2 5.3 3.5 4 5.1 4
                        Z

                        M8.1 11.55
                        A1.15 1.15 0 1 0 8.1 9.25
                        A1.15 1.15 0 0 0 8.1 11.55
                        Z

                        M12 11.55
                        A1.15 1.15 0 1 0 12 9.25
                        A1.15 1.15 0 0 0 12 11.55
                        Z

                        M15.9 11.55
                        A1.15 1.15 0 1 0 15.9 9.25
                        A1.15 1.15 0 0 0 15.9 11.55
                        Z
                    "
                />
            </svg>

            {
                unreadCount > 0 && (
                    <span
                        className={
                            "header-action-badge chat-shortcut-badge"
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
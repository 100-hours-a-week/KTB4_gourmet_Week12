import {
    NavLink
} from "react-router";

import "../../styles/header-actions.css";

function FriendShortcutButton() {
    return (
        <NavLink
            to="/friends"
            className={function ({
                isActive
            }) {
                return [
                    "header-action-button",
                    "friend-shortcut-button",
                    isActive
                        ? "is-active"
                        : ""
                ]
                    .filter(Boolean)
                    .join(" ");
            }}
            aria-label="친구 찾기 및 친구 요청 관리"
            title="친구"
        >
            <svg
                className="header-action-icon friend-shortcut-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="currentColor"
            >
                <circle cx="9" cy="7.6" r="3.2" />
                <path
                    d="
                        M3.4 19.8
                        C3.9 16.2 6.1 14 9 14
                        C11.9 14 14.1 16.2 14.6 19.8
                        Z
                    "
                />
                <circle cx="16.5" cy="8.1" r="2.6" />
                <path
                    d="
                        M12.6 19.8
                        C13.1 17.1 14.7 15.2 16.7 15.2
                        C18.7 15.2 20.3 17.1 20.8 19.8
                        Z
                    "
                />
            </svg>
        </NavLink>
    );
}

export default FriendShortcutButton;
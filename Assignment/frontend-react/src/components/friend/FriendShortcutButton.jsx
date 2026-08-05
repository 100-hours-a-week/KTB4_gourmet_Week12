import {
    NavLink
} from "react-router";

import "../../styles/friend-shortcut.css";

function FriendShortcutButton() {
    return (
        <NavLink
            to="/friends"
            className={function ({
                isActive
            }) {
                return [
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
                className="friend-shortcut-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    d="
                        M14 20
                        C14 16.7 11.5 14 8.5 14
                        C5.5 14 3 16.7 3 20

                        M8.5 11
                        C10.7 11 12.5 9.2 12.5 7
                        C12.5 4.8 10.7 3 8.5 3
                        C6.3 3 4.5 4.8 4.5 7
                        C4.5 9.2 6.3 11 8.5 11

                        M18 7
                        V13

                        M15 10
                        H21
                    "
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </NavLink>
    );
}

export default FriendShortcutButton;
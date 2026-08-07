import {
    useEffect
} from "react";

import {
    Link,
    Outlet,
    useLocation
} from "react-router";

import ChatRoomListPanel
    from "../components/chat/ChatRoomListPanel.jsx";

import BoardBackButton
    from "../components/common/BoardBackButton.jsx";

import useMediaQuery
    from "../hooks/useMediaQuery.js";

import "../styles/chat-list.css";
import "../styles/chat-shell.css";

function resolveActiveRoomId(
    pathname
) {
    const match =
        pathname.match(
            /^\/chats\/(\d+)/
        );

    if (!match) {
        return null;
    }

    const roomId =
        Number(match[1]);

    return Number.isInteger(roomId)
        && roomId > 0
        ? roomId
        : null;
}

function ChatLayoutPage() {
    const location =
        useLocation();

    const isMobile =
        useMediaQuery(
            "(max-width: 820px)"
        );

    const activeRoomId =
        resolveActiveRoomId(
            location.pathname
        );

    const showList =
        !isMobile
        || !activeRoomId;

    const showConversation =
        !isMobile
        || Boolean(activeRoomId);

    useEffect(
        function () {
            document.title =
                "채팅 · Gourmet Community";
        },
        []
    );

    return (
        <section className="chat-shell-page">
            <BoardBackButton />

            <div
                className={[
                    "chat-shell",
                    activeRoomId
                        ? "has-active-room"
                        : ""
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                <aside
                    className={[
                        "chat-shell-sidebar",
                        showList
                            ? ""
                            : "is-hidden"
                    ]
                        .filter(Boolean)
                        .join(" ")}
                    aria-label="채팅방 목록"
                >
                    <header className="chat-sidebar-header">
                        <h2>채팅</h2>

                        <Link
                            to="/friends"
                            className="chat-sidebar-friends-link"
                        >
                            친구에서 시작
                        </Link>
                    </header>

                    <ChatRoomListPanel
                        activeRoomId={
                            activeRoomId
                        }
                    />
                </aside>

                <div
                    className={[
                        "chat-shell-main",
                        showConversation
                            ? ""
                            : "is-hidden"
                    ]
                        .filter(Boolean)
                        .join(" ")}
                >
                    <Outlet />
                </div>
            </div>
        </section>
    );
}

export default ChatLayoutPage;

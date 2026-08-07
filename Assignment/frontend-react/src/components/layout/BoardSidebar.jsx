import { NavLink } from "react-router";

import {
    BOARD_LINKS
} from "../../constants/boards.js";

const BOARD_ICONS = {
    chat: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M5 6.5C5 5.1 6.1 4 7.5 4h9C17.9 4 19 5.1 19 6.5v6c0 1.4-1.1 2.5-2.5 2.5H11l-4 3.2V15H7.5C6.1 15 5 13.9 5 12.5v-6Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
            />
        </svg>
    ),
    question: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle
                cx="12"
                cy="12"
                r="8.2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
            />
            <path
                d="M9.6 9.4c.4-1.3 1.5-2 2.6-2 1.4 0 2.4.9 2.4 2.2 0 1.5-1.3 2-2.1 2.5-.6.4-.9.8-.9 1.6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />
            <circle cx="12" cy="16.6" r="1" fill="currentColor" />
        </svg>
    ),
    book: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M5 5.5C5 4.7 5.7 4 6.5 4H18v14.5H6.5C5.7 18.5 5 17.8 5 17V5.5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
            />
            <path
                d="M5 17.2h12.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />
        </svg>
    ),
    users: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle
                cx="9"
                cy="9"
                r="3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
            />
            <path
                d="M4.5 18.5c.7-2.4 2.5-3.7 4.5-3.7s3.8 1.3 4.5 3.7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />
            <circle
                cx="16.5"
                cy="9.2"
                r="2.4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
            />
            <path
                d="M15.2 14.8c1.5.3 2.8 1.3 3.4 3.2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />
        </svg>
    )
};

function BoardSidebar({
    isOpen,
    onNavigate
}) {
    return (
        <aside
            className={
                `board-sidebar ${
                    isOpen
                        ? "is-open"
                        : "is-closed"
                }`
            }
            aria-label="게시판 메뉴"
        >
            <p className="board-sidebar-label">
                게시판
            </p>

            <nav className="board-navigation">
                {
                    BOARD_LINKS.map(function (board) {
                        return (
                            <NavLink
                                key={board.routeType}
                                to={board.path}
                                className={
                                    function ({
                                        isActive
                                    }) {
                                        return (
                                            `board-navigation-link ${
                                                isActive
                                                    ? "active"
                                                    : ""
                                            }`
                                        );
                                    }
                                }
                                onClick={onNavigate}
                            >
                                <span className="board-navigation-icon">
                                    {
                                        BOARD_ICONS[
                                            board.icon
                                        ]
                                    }
                                </span>
                                <span>
                                    {board.title}
                                </span>
                            </NavLink>
                        );
                    })
                }
            </nav>
        </aside>
    );
}

export default BoardSidebar;

import { NavLink } from "react-router";

import {
    BOARD_LINKS
} from "../../constants/boards.js";

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
                                {board.title}
                            </NavLink>
                        );
                    })
                }
            </nav>
        </aside>
    );
}

export default BoardSidebar;
import { useState } from "react";

import { Outlet } from "react-router";

import BoardSidebar from
    "../components/layout/BoardSidebar.jsx";

import CommunityHeader from
    "../components/layout/CommunityHeader.jsx";

import "../styles/community.css";

function CommunityLayout() {
    const [
        isSidebarOpen,
        setIsSidebarOpen
    ] = useState(true);

    function toggleSidebar() {
        setIsSidebarOpen(
            function (current) {
                return !current;
            }
        );
    }

    return (
        <div className="community-shell">
            <div
                className="community-atmosphere"
                aria-hidden="true"
            />

            <CommunityHeader
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={toggleSidebar}
            />

            <div
                className={
                    `community-body ${
                        isSidebarOpen
                            ? ""
                            : "sidebar-collapsed"
                    }`
                }
            >
                <BoardSidebar
                    isOpen={isSidebarOpen}
                />

                <main className="community-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default CommunityLayout;
import { useEffect, useState } from "react";

import { Outlet } from "react-router";

import BoardSidebar from
    "../components/layout/BoardSidebar.jsx";

import CommunityHeader from
    "../components/layout/CommunityHeader.jsx";

import useMediaQuery from
    "../hooks/useMediaQuery.js";

import "../styles/community.css";

function CommunityLayout() {
    const isNarrowViewport =
        useMediaQuery(
            "(max-width: 820px)"
        );

    const [
        isSidebarOpen,
        setIsSidebarOpen
    ] = useState(
        !isNarrowViewport
    );

    useEffect(
        function () {
            setIsSidebarOpen(
                !isNarrowViewport
            );
        },
        [isNarrowViewport]
    );

    function toggleSidebar() {
        setIsSidebarOpen(
            function (current) {
                return !current;
            }
        );
    }

    function handleSidebarNavigate() {
        if (isNarrowViewport) {
            setIsSidebarOpen(false);
        }
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
                    onNavigate={handleSidebarNavigate}
                />

                <main className="community-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default CommunityLayout;

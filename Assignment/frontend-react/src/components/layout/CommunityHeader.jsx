import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router";

import FriendShortcutButton
    from "../friend/FriendShortcutButton.jsx";

import NotificationBell
    from "../notification/NotificationBell.jsx";

import useAuth
    from "../../hooks/useAuth.js";

import {
    resolveAssetUrl
} from "../../utils/assetUrl.js";

import ChatShortcutButton
    from "../chat/ChatShortcutButton.jsx";

function CommunityHeader({
    isSidebarOpen,
    onToggleSidebar
}) {
    const navigate = useNavigate();

    const profileMenuRef =
        useRef(null);

    const {
        currentUser,
        signOut
    } = useAuth();

    const [
        searchKeyword,
        setSearchKeyword
    ] = useState("");

    const [
        isProfileMenuOpen,
        setIsProfileMenuOpen
    ] = useState(false);

    const [
        isLoggingOut,
        setIsLoggingOut
    ] = useState(false);

    useEffect(function () {
        function handleOutsideClick(
            event
        ) {
            if (
                profileMenuRef.current
                && !profileMenuRef.current
                    .contains(event.target)
            ) {
                setIsProfileMenuOpen(
                    false
                );
            }
        }

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return function () {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);

    function handleSearchSubmit(
        event
    ) {
        event.preventDefault();

        const keyword =
            searchKeyword.trim();

        if (!keyword) {
            return;
        }

        const query =
            new URLSearchParams({
                keyword,
                searchType: "ALL",
                sortType: "LATEST",
                page: "0",
                size: "10"
            });

        navigate(
            `/search?${query.toString()}`
        );
    }

    function closeProfileMenuAndNavigate(
        path
    ) {
        setIsProfileMenuOpen(false);
        navigate(path);
    }

    async function handleLogout() {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);

        try {
            await signOut();

            setIsProfileMenuOpen(false);

            navigate(
                "/login",
                {
                    replace: true,
                    state: {
                        notice:
                            "로그아웃되었습니다."
                    }
                }
            );
        } catch (error) {
            console.error(
                "로그아웃 요청 오류:",
                error
            );

            alert(
                error?.message
                ?? "로그아웃에 실패했습니다."
            );
        } finally {
            setIsLoggingOut(false);
        }
    }

    const nickname =
        currentUser?.nickname
        || "회원";

    const profileImage =
        resolveAssetUrl(
            currentUser?.profileImage
        );

    return (
        <header className="community-header">
            <button
                type="button"
                className="sidebar-toggle"
                aria-label={
                    isSidebarOpen
                        ? "게시판 메뉴 닫기"
                        : "게시판 메뉴 열기"
                }
                aria-expanded={isSidebarOpen}
                onClick={onToggleSidebar}
            >
                <span />
                <span />
                <span />
            </button>

            <Link
                to="/boards/free"
                className="community-logo"
                aria-label={
                    "Gourmet Community 홈"
                }
            >
                <img
                    src={
                        "/images/gourmet-logo.png"
                    }
                    alt="Gourmet Community"
                />
            </Link>

            <form
                className="community-search"
                role="search"
                onSubmit={
                    handleSearchSubmit
                }
            >
                <label
                    className="visually-hidden"
                    htmlFor={
                        "community-search-input"
                    }
                >
                    통합 검색
                </label>

                <input
                    type="search"
                    id={
                        "community-search-input"
                    }
                    value={searchKeyword}
                    placeholder={
                        "게시글 통합 검색"
                    }
                    autoComplete="off"
                    maxLength={100}
                    onChange={
                        function (event) {
                            setSearchKeyword(
                                event.target.value
                            );
                        }
                    }
                />

                <button type="submit">
                    검색
                </button>
            </form>

            <div
                className={
                    "header-user-actions"
                }
            >
                <FriendShortcutButton />
                <ChatShortcutButton />
                <NotificationBell />

                <div
                    className={
                        "community-profile"
                    }
                    ref={profileMenuRef}
                >
                    <button
                        type="button"
                        className={
                            "community-profile-button"
                        }
                        aria-label={
                            "프로필 메뉴"
                        }
                        aria-expanded={
                            isProfileMenuOpen
                        }
                        onClick={
                            function () {
                                setIsProfileMenuOpen(
                                    function (
                                        current
                                    ) {
                                        return !current;
                                    }
                                );
                            }
                        }
                    >
                        {
                            profileImage
                                ? (
                                    <img
                                        src={
                                            profileImage
                                        }
                                        alt=""
                                    />
                                )
                                : (
                                    <span
                                        aria-hidden={
                                            "true"
                                        }
                                    >
                                        {
                                            nickname
                                                .charAt(0)
                                                .toUpperCase()
                                        }
                                    </span>
                                )
                        }
                    </button>

                    {
                        isProfileMenuOpen
                        && (
                            <div
                                className={
                                    "community-profile-menu"
                                }
                                role="menu"
                            >
                                <p
                                    className={
                                        "profile-menu-user"
                                    }
                                >
                                    <strong>
                                        {nickname}
                                    </strong>

                                    <span>
                                        {
                                            currentUser
                                                ?.email
                                            ?? ""
                                        }
                                    </span>
                                </p>

                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={
                                        function () {
                                            closeProfileMenuAndNavigate(
                                                "/profile/edit"
                                            );
                                        }
                                    }
                                >
                                    회원정보 수정
                                </button>

                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={
                                        function () {
                                            closeProfileMenuAndNavigate(
                                                "/profile/password"
                                            );
                                        }
                                    }
                                >
                                    비밀번호 수정
                                </button>

                                <button
                                    type="button"
                                    role="menuitem"
                                    className={
                                        "logout-menu-button"
                                    }
                                    disabled={
                                        isLoggingOut
                                    }
                                    onClick={
                                        handleLogout
                                    }
                                >
                                    {
                                        isLoggingOut
                                            ? "로그아웃 중"
                                            : "로그아웃"
                                    }
                                </button>
                            </div>
                        )
                    }
                </div>
            </div>
        </header>
    );
}

export default CommunityHeader;
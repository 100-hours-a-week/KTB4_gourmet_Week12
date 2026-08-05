import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    useNavigate
} from "react-router";

import {
    acceptFriendRequest,
    cancelFriendRequest,
    getFriends,
    getReceivedFriendRequests,
    getSentFriendRequests,
    rejectFriendRequest,
    searchUsers,
    sendFriendRequest
} from "../api/friendApi.js";

import {
    getOrCreateFriendChatRoom
} from "../api/chatApi.js";

import {
    subscribeFriendDataChanged
} from "../events/friendEvents.js";

import FriendListSection
    from "../components/friend/FriendListSection.jsx";

import FriendRequestSection
    from "../components/friend/FriendRequestSection.jsx";

import FriendSearchSection
    from "../components/friend/FriendSearchSection.jsx";

import "../styles/friends.css";

function FriendsPage() {

    const navigate =
        useNavigate();

    const relationshipControllerRef =
        useRef(null);

    const searchControllerRef =
        useRef(null);

    /*
     * 이벤트 리스너 안에서도 가장 최근 검색어를
     * 참조할 수 있도록 Ref로 함께 관리한다.
     */
    const submittedKeywordRef =
        useRef("");

    const [
        friends,
        setFriends
    ] = useState([]);

    const [
        receivedRequests,
        setReceivedRequests
    ] = useState([]);

    const [
        sentRequests,
        setSentRequests
    ] = useState([]);

    const [
        keyword,
        setKeyword
    ] = useState("");


    const [
        searchResults,
        setSearchResults
    ] = useState([]);

    const [
        hasSearched,
        setHasSearched
    ] = useState(false);

    const [
        isLoading,
        setIsLoading
    ] = useState(true);

    const [
        isSearching,
        setIsSearching
    ] = useState(false);

    const [
        processingKey,
        setProcessingKey
    ] = useState(null);

    const [
        chattingUserId,
        setChattingUserId
    ] = useState(null);

    const [
        pageError,
        setPageError
    ] = useState("");

    const [
        searchError,
        setSearchError
    ] = useState("");

    useEffect(function () {
        document.title =
            "친구 · Gourmet Community";

        loadRelationshipData();

        const unsubscribe =
            subscribeFriendDataChanged(
                function () {
                    /*
                     * 상대방의 수락·요청·취소 정보가
                     * SSE를 통해 전달되면 새로고침 없이
                     * 서버의 최신 상태를 다시 조회한다.
                     */
                    loadRelationshipData();

                    const currentKeyword =
                        submittedKeywordRef
                            .current;

                    if (currentKeyword) {
                        loadSearchResults(
                            currentKeyword
                        );
                    }
                }
            );

        return function () {
            unsubscribe();

            relationshipControllerRef
                .current
                ?.abort();

            searchControllerRef
                .current
                ?.abort();
        };
    }, []);

    async function loadRelationshipData() {
        relationshipControllerRef
            .current
            ?.abort();

        const controller =
            new AbortController();

        relationshipControllerRef.current =
            controller;

        setIsLoading(true);
        setPageError("");

        try {
            const [
                friendResponse,
                receivedResponse,
                sentResponse
            ] = await Promise.all([
                getFriends({
                    page: 0,
                    size: 50,
                    signal:
                        controller.signal
                }),

                getReceivedFriendRequests({
                    page: 0,
                    size: 20,
                    signal:
                        controller.signal
                }),

                getSentFriendRequests({
                    page: 0,
                    size: 20,
                    signal:
                        controller.signal
                })
            ]);

            if (controller.signal.aborted) {
                return;
            }

            setFriends(
                friendResponse?.content ?? []
            );

            setReceivedRequests(
                receivedResponse?.content ?? []
            );

            setSentRequests(
                sentResponse?.content ?? []
            );
        } catch (error) {
            if (
                error?.name === "AbortError"
            ) {
                return;
            }

            setPageError(
                error?.message
                ?? "친구 정보를 불러오지 못했습니다."
            );
        } finally {
            if (!controller.signal.aborted) {
                setIsLoading(false);
            }
        }
    }

    async function loadSearchResults(
        targetKeyword
    ) {
        searchControllerRef
            .current
            ?.abort();

        const controller =
            new AbortController();

        searchControllerRef.current =
            controller;

        setIsSearching(true);
        setSearchError("");

        try {
            const response =
                await searchUsers(
                    targetKeyword,
                    {
                        page: 0,
                        size: 20,
                        signal:
                            controller.signal
                    }
                );

            if (controller.signal.aborted) {
                return;
            }

            setSearchResults(
                response?.content ?? []
            );

            setHasSearched(true);
        } catch (error) {
            if (
                error?.name === "AbortError"
            ) {
                return;
            }

            setSearchError(
                error?.message
                ?? "사용자를 검색하지 못했습니다."
            );

            setHasSearched(true);
        } finally {
            if (!controller.signal.aborted) {
                setIsSearching(false);
            }
        }
    }

    async function refreshAfterAction() {
        await loadRelationshipData();

        const currentKeyword =
            submittedKeywordRef.current;

        if (currentKeyword) {
            await loadSearchResults(
                currentKeyword
            );
        }
    }

    async function executeAction(
        key,
        action
    ) {
        if (processingKey !== null) {
            return;
        }

        setProcessingKey(key);
        setPageError("");
        setSearchError("");

        try {
            await action();
            await refreshAfterAction();
        } catch (error) {
            const message =
                error?.message
                ?? "친구 요청을 처리하지 못했습니다.";

            setPageError(message);
            setSearchError(message);
        } finally {
            setProcessingKey(null);
        }
    }

    function handleSearch(event) {
        event.preventDefault();

        const normalizedKeyword =
            keyword.trim();

        if (
            normalizedKeyword.length < 2
        ) {
            setSearchError(
                "닉네임을 2자 이상 입력해주세요."
            );
            return;
        }

        submittedKeywordRef.current =
            normalizedKeyword;

        loadSearchResults(
            normalizedKeyword
        );
    }

    function resolveChatRoomId(
        chatRoom
    ) {
        /*
         * 현재 백엔드 응답의 roomId를 우선 사용한다.
         *
         * 기존 DTO가 id로 작성되어 있어도
         * 프론트가 바로 동작하도록 보조 처리한다.
         */
        const roomId =
            Number(
                chatRoom?.roomId
                ?? chatRoom?.id
            );

        if (
            !Number.isInteger(roomId)
            || roomId < 1
        ) {
            throw new Error(
                "채팅방 응답에 채팅방 번호가 없습니다."
            );
        }

        return roomId;
    }

    async function handleStartChat(
        friendUserId
    ) {
        if (chattingUserId !== null) {
            return;
        }

        const normalizedFriendUserId =
            Number(friendUserId);

        if (
            !Number.isInteger(
                normalizedFriendUserId
            )
            || normalizedFriendUserId < 1
        ) {
            setPageError(
                "친구 사용자 정보가 올바르지 않습니다."
            );

            return;
        }

        setChattingUserId(
            normalizedFriendUserId
        );

        setPageError("");

        try {
            const chatRoom =
                await getOrCreateFriendChatRoom(
                    normalizedFriendUserId
                );

            const roomId =
                resolveChatRoomId(
                    chatRoom
                );

            navigate(
                `/chats/${roomId}`,
                {
                    state: {
                        chatRoom
                    }
                }
            );
        } catch (error) {
            setPageError(
                error?.message
                ?? "채팅방을 열지 못했습니다."
            );
        } finally {
            setChattingUserId(null);
        }
    }

    function handleSend(
        receiverId,
        key
    ) {
        return executeAction(
            key,
            function () {
                return sendFriendRequest(
                    receiverId
                );
            }
        );
    }

    function handleAccept(
        requestId,
        key
    ) {
        return executeAction(
            key,
            function () {
                return acceptFriendRequest(
                    requestId
                );
            }
        );
    }

    function handleReject(
        requestId,
        key
    ) {
        return executeAction(
            key,
            function () {
                return rejectFriendRequest(
                    requestId
                );
            }
        );
    }

    function handleCancel(
        requestId,
        key
    ) {
        return executeAction(
            key,
            function () {
                return cancelFriendRequest(
                    requestId
                );
            }
        );
    }

    return (
        <div className="friends-page">
            <section className="friends-page-intro">
                <p className="friends-eyebrow">
                    GOURMET CONNECTIONS
                </p>

                <h1>친구</h1>

                <p>
                    함께 이야기하고 싶은 회원을 찾고
                    친구 요청을 관리해보세요.
                </p>
            </section>

            {
                pageError && (
                    <p
                        className="friends-page-error"
                        role="alert"
                    >
                        {pageError}
                    </p>
                )
            }

            <div className="friends-page-grid">
                <div className="friends-page-primary">
                    <FriendSearchSection
                        keyword={keyword}
                        results={searchResults}
                        hasSearched={hasSearched}
                        isSearching={isSearching}
                        searchError={searchError}
                        processingKey={processingKey}
                        onKeywordChange={setKeyword}
                        onSearch={handleSearch}
                        onSend={handleSend}
                        onCancel={handleCancel}
                        onAccept={handleAccept}
                        onReject={handleReject}
                    />

                    <FriendRequestSection
                        receivedRequests={
                            receivedRequests
                        }
                        sentRequests={
                            sentRequests
                        }
                        processingKey={
                            processingKey
                        }
                        onAccept={handleAccept}
                        onReject={handleReject}
                        onCancel={handleCancel}
                    />
                </div>

                <aside className="friends-page-side">
                    <FriendListSection
                        friends={friends}
                        isLoading={isLoading}
                        chattingUserId={
                            chattingUserId
                        }
                        onStartChat={
                            handleStartChat
                        }
                    />
                </aside>
            </div>
        </div>
    );
}

export default FriendsPage;
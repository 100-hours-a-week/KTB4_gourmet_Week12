import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    Link,
    Navigate,
    useParams
} from "react-router";

import PopularPostList from
    "../components/post/PopularPostList.jsx";

import PostCard from
    "../components/post/PostCard.jsx";

import {
    getPopularPosts
} from "../api/postApi.js";

import {
    getBoardConfig
} from "../constants/boards.js";

import useBoardPosts from
    "../hooks/useBoardPosts.js";

function ValidBoardPage({ board }) {
    const loadMoreTarget =
        useRef(null);

    const [
        popularPosts,
        setPopularPosts
    ] = useState([]);

    const [
        isPopularLoading,
        setIsPopularLoading
    ] = useState(true);

    const [
        popularError,
        setPopularError
    ] = useState("");

    const {
        posts,
        hasNext,
        isLoading,
        error,
        loadMore
    } = useBoardPosts(
        board.apiType
    );

    useEffect(function () {
        document.title =
            `${board.title} · Gourmet Community`;
    }, [board.title]);

    useEffect(function () {
        const controller =
            new AbortController();

        async function loadPopularPosts() {
            setIsPopularLoading(true);
            setPopularError("");

            try {
                const response =
                    await getPopularPosts({
                        limit: 3,
                        signal:
                            controller.signal
                    });

                setPopularPosts(
                    Array.isArray(response)
                        ? response
                        : []
                );
            } catch (requestError) {
                if (
                    requestError.name
                    === "AbortError"
                ) {
                    return;
                }

                setPopularError(
                    requestError.message
                    || "인기 게시글을 불러오지 못했습니다."
                );
            } finally {
                if (
                    !controller
                        .signal
                        .aborted
                ) {
                    setIsPopularLoading(
                        false
                    );
                }
            }
        }

        loadPopularPosts();

        return function () {
            controller.abort();
        };
    }, []);

    useEffect(function () {
        const target =
            loadMoreTarget.current;

        if (
            !target ||
            !hasNext
        ) {
            return undefined;
        }

        const observer =
            new IntersectionObserver(
                function (entries) {
                    const entry =
                        entries[0];

                    if (
                        entry.isIntersecting &&
                        !isLoading
                    ) {
                        loadMore();
                    }
                },
                {
                    rootMargin:
                        "240px 0px"
                }
            );

        observer.observe(target);

        return function () {
            observer.disconnect();
        };
    }, [
        hasNext,
        isLoading,
        loadMore
    ]);

    const isInitialLoading =
        isLoading &&
        posts.length === 0;

    return (
        <div className="board-page">
            <section className="board-intro">
                <div className="board-intro-copy">
                    <p className="board-eyebrow">
                        {board.eyebrow}
                    </p>

                    <h1>{board.title}</h1>

                    <p className="board-description">
                        {board.description}
                    </p>
                </div>

                <Link
                    to={board.writePath}
                    className="board-write-button"
                >
                    <span
                        className="board-write-icon"
                        aria-hidden="true"
                    >
                        ✎
                    </span>
                    {board.writeLabel}
                </Link>
            </section>

            <PopularPostList
                items={popularPosts}
                isLoading={isPopularLoading}
                error={popularError}
            />

            <section className="board-action">
                <h2>{board.listTitle}</h2>
            </section>

            <section
                className="board-post-list"
                aria-live="polite"
            >
                {
                    isInitialLoading && (
                        <p className="board-state-message">
                            게시글을 불러오는 중입니다.
                        </p>
                    )
                }

                {
                    !isInitialLoading &&
                    posts.length === 0 &&
                    !error && (
                        <p className="board-state-message">
                            {board.emptyMessage}
                        </p>
                    )
                }

                {
                    posts.map(function (post) {
                        return (
                            <PostCard
                                key={
                                    post.id ??
                                    post.postId
                                }
                                post={post}
                            />
                        );
                    })
                }

                {
                    error && (
                        <p className="board-error-message">
                            {error}
                        </p>
                    )
                }

                <div
                    ref={loadMoreTarget}
                    className="load-more-target"
                    aria-hidden="true"
                />

                {
                    isLoading &&
                    posts.length > 0 && (
                        <p className="board-loading-more">
                            추가 게시글을 불러오는 중입니다.
                        </p>
                    )
                }

                {
                    !hasNext &&
                    posts.length > 0 && (
                        <p className="board-list-end">
                            모든 게시글을 불러왔습니다.
                        </p>
                    )
                }
            </section>
        </div>
    );
}

function BoardPage() {
    const {
        boardType
    } = useParams();

    const board =
        getBoardConfig(boardType);

    if (!board) {
        return (
            <Navigate
                to="/boards/free"
                replace
            />
        );
    }

    return (
        <ValidBoardPage board={board} />
    );
}

export default BoardPage;
import {
    useEffect,
    useRef
} from "react";

import {
    Link,
    Navigate,
    useParams
} from "react-router";

import PostCard from
    "../components/post/PostCard.jsx";

import {
    getBoardConfig
} from "../constants/boards.js";

import useBoardPosts from
    "../hooks/useBoardPosts.js";

function ValidBoardPage({ board }) {
    const loadMoreTarget =
        useRef(null);

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
                <p className="board-eyebrow">
                    {board.eyebrow}
                </p>

                <h1>{board.title}</h1>

                <p className="board-description">
                    {board.description}
                </p>
            </section>

            <section className="board-action">
                <h2>{board.listTitle}</h2>

                <Link
                    to={board.writePath}
                    className="board-write-button"
                >
                    {board.writeLabel}
                </Link>
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
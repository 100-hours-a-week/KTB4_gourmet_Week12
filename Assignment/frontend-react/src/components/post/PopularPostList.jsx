import {
    Link
} from "react-router";

import {
    formatCount
} from "../../utils/formatters.js";

const BOARD_BADGES = {
    FREE: "자유 게시판",
    QUESTION: "질문 게시판",
    STUDY: "학습 기록",
    PROJECT: "프로젝트 모집"
};

const MEDAL_BY_RANK = {
    1: {
        emoji: "🥇",
        label: "1위",
        className: "is-gold"
    },
    2: {
        emoji: "🥈",
        label: "2위",
        className: "is-silver"
    },
    3: {
        emoji: "🥉",
        label: "3위",
        className: "is-bronze"
    }
};

function formatPopularTime(createdAt) {
    if (!createdAt) {
        return "";
    }

    const createdTime =
        new Date(createdAt).getTime();

    const differenceSeconds =
        Math.max(
            0,
            Math.floor(
                (
                    Date.now()
                    - createdTime
                ) / 1000
            )
        );

    if (differenceSeconds < 60) {
        return "방금 전";
    }

    const minutes =
        Math.floor(
            differenceSeconds / 60
        );

    if (minutes < 60) {
        return `${minutes}분 전`;
    }

    const hours =
        Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours}시간 전`;
    }

    const days =
        Math.floor(hours / 24);

    return `${days}일 전`;
}

function isHotPost(post) {
    if (!post?.createdAt) {
        return false;
    }

    const createdTime =
        new Date(post.createdAt).getTime();

    if (
        Number.isNaN(createdTime)
    ) {
        return false;
    }

    const hoursSince =
        (
            Date.now()
            - createdTime
        ) / (1000 * 60 * 60);

    if (hoursSince > 3) {
        return false;
    }

    const likes =
        Number(post.likeCount) || 0;

    const comments =
        Number(post.commentCount) || 0;

    return likes + comments >= 1;
}

function PopularPostList({
    items,
    isLoading,
    error
}) {
    return (
        <section
            className="popular-posts"
            aria-labelledby="popular-posts-title"
        >
            <div className="popular-posts-heading">
                <div className="popular-posts-title-row">
                    <span
                        className="popular-posts-fire"
                        aria-hidden="true"
                    >
                        🔥
                    </span>

                    <h2 id="popular-posts-title">
                        지금 인기 있는 글
                    </h2>
                </div>

                <p>
                    최근 7일 내 작성된 인기 게시글이에요.
                </p>
            </div>

            {
                isLoading && (
                    <p className="popular-posts-state">
                        인기 게시글을 불러오는 중입니다.
                    </p>
                )
            }

            {
                !isLoading &&
                error && (
                    <p className="popular-posts-state is-error">
                        {error}
                    </p>
                )
            }

            {
                !isLoading &&
                !error &&
                items.length === 0 && (
                    <p className="popular-posts-state">
                        최근 7일간 반응이 쌓인 글이 없습니다.
                    </p>
                )
            }

            {
                !isLoading &&
                !error &&
                items.length > 0 && (
                    <ol className="popular-posts-grid">
                        {
                            items.map(function (
                                item,
                                index
                            ) {
                                const post =
                                    item.post ??
                                    item;

                                const rank =
                                    item.rank ??
                                    index + 1;

                                const postId =
                                    post.id ??
                                    post.postId;

                                const medal =
                                    MEDAL_BY_RANK[
                                        rank
                                    ];

                                const isHot =
                                    isHotPost(post);

                                const rankClass =
                                    rank === 1
                                        ? "is-rank-1"
                                        : rank === 2
                                            ? "is-rank-2"
                                            : rank === 3
                                                ? "is-rank-3"
                                                : "";

                                return (
                                    <li
                                        key={postId}
                                        className={[
                                            "popular-post-list-item",
                                            rankClass
                                        ]
                                            .filter(Boolean)
                                            .join(" ")}
                                    >
                                        <Link
                                            to={`/posts/${postId}`}
                                            className={[
                                                "popular-post-card",
                                                rankClass
                                            ]
                                                .filter(Boolean)
                                                .join(" ")}
                                        >
                                            <div className="popular-post-card-top">
                                                {
                                                    medal
                                                        ? (
                                                            <span
                                                                className={
                                                                    `popular-post-medal ${
                                                                        medal.className
                                                                    }`
                                                                }
                                                            >
                                                                <span
                                                                    className="popular-post-medal-icon"
                                                                    aria-hidden="true"
                                                                >
                                                                    {
                                                                        medal.emoji
                                                                    }
                                                                </span>

                                                                <span className="popular-post-medal-label">
                                                                    {
                                                                        medal.label
                                                                    }
                                                                </span>
                                                            </span>
                                                        )
                                                        : (
                                                            <span className="popular-post-rank-label">
                                                                TOP {rank}
                                                            </span>
                                                        )
                                                }

                                                <div className="popular-post-card-badges">
                                                    {
                                                        isHot && (
                                                            <span className="popular-post-hot-badge">
                                                                HOT
                                                            </span>
                                                        )
                                                    }

                                                    <span className="popular-post-board">
                                                        {
                                                            BOARD_BADGES[
                                                                post.boardType
                                                            ] ?? "게시글"
                                                        }
                                                    </span>
                                                </div>
                                            </div>

                                            <h3>
                                                {
                                                    post.title
                                                    ?? "제목 없음"
                                                }
                                            </h3>

                                            <div
                                                className="popular-post-reactions"
                                                aria-label="게시글 반응"
                                            >
                                                <span>
                                                    <span aria-hidden="true">
                                                        ♥
                                                    </span>
                                                    {
                                                        formatCount(
                                                            post.likeCount
                                                        )
                                                    }
                                                </span>

                                                <span>
                                                    <span aria-hidden="true">
                                                        💬
                                                    </span>
                                                    {
                                                        formatCount(
                                                            post.commentCount
                                                        )
                                                    }
                                                </span>

                                                <span>
                                                    <span aria-hidden="true">
                                                        👁
                                                    </span>
                                                    {
                                                        formatCount(
                                                            post.viewCount
                                                        )
                                                    }
                                                </span>
                                            </div>

                                            <div className="popular-post-footer">
                                                <p className="popular-post-author">
                                                    <span
                                                        className="popular-post-author-avatar"
                                                        aria-hidden="true"
                                                    >
                                                        {
                                                            String(
                                                                post.nickname
                                                                ?? "작"
                                                            )
                                                                .charAt(0)
                                                        }
                                                    </span>
                                                    {
                                                        post.nickname
                                                        ?? "작성자"
                                                    }
                                                </p>

                                                <time
                                                    dateTime={
                                                        post.createdAt
                                                    }
                                                >
                                                    {
                                                        formatPopularTime(
                                                            post.createdAt
                                                        )
                                                    }
                                                </time>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })
                        }
                    </ol>
                )
            }
        </section>
    );
}

export default PopularPostList;

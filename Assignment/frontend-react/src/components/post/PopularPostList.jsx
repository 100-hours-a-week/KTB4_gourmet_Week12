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

                                const rankClass =
                                    rank <= 3
                                        ? `rank-${rank}`
                                        : "rank-default";

                                return (
                                    <li
                                        key={postId}
                                        className="popular-post-list-item"
                                    >
                                        <Link
                                            to={`/posts/${postId}`}
                                            className="popular-post-card"
                                        >
                                            <div className="popular-post-card-top">
                                                <span
                                                    className={[
                                                        "popular-post-rank",
                                                        rankClass
                                                    ].join(" ")}
                                                >
                                                    {rank}
                                                </span>

                                                <span className="popular-post-board">
                                                    {
                                                        BOARD_BADGES[
                                                            post.boardType
                                                        ] ?? "게시글"
                                                    }
                                                </span>
                                            </div>

                                            <h3>
                                                {
                                                    post.title
                                                    ?? "제목 없음"
                                                }
                                            </h3>

                                            <p className="popular-post-author">
                                                {
                                                    post.nickname
                                                    ?? "작성자"
                                                }
                                            </p>

                                            <div className="popular-post-stats">
                                                <span>
                                                    ♥{" "}
                                                    {
                                                        formatCount(
                                                            post.likeCount
                                                        )
                                                    }
                                                </span>

                                                <span>
                                                    댓글{" "}
                                                    {
                                                        formatCount(
                                                            post.commentCount
                                                        )
                                                    }
                                                </span>

                                                <span>
                                                    조회{" "}
                                                    {
                                                        formatCount(
                                                            post.viewCount
                                                        )
                                                    }
                                                </span>
                                            </div>

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
import { Link } from "react-router";

import {
    formatCount,
    formatDate
} from "../../utils/formatters.js";

import {
    resolveAssetUrl
} from "../../utils/assetUrl.js";

import {
    parseProjectContent
} from "../../utils/projectContent.js";

const BOARD_BADGES = {
    FREE: "FREE",
    QUESTION: "Q&A",
    STUDY: "STUDY LOG",
    PROJECT: "RECRUIT"
};

function PostCard({
    post,
    showExcerpt = false
}) {
    const postId =
        post.id ??
        post.postId;

    const title =
        post.title ??
        "제목 없음";

    const nickname =
        post.nickname ??
        "작성자";

    const profileImage =
        resolveAssetUrl(
            post.profileImage
        );

    const thumbnail =
        Array.isArray(post.imageUrls) &&
        post.imageUrls.length > 0
            ? resolveAssetUrl(
                post.imageUrls[0]
            )
            : "";

    const projectContent =
        post.boardType === "PROJECT"
            ? parseProjectContent(
                post.content
            )
            : null;

    const displayContent =
        projectContent
            ? projectContent.content
            : post.content ?? "";

    const excerpt =
        String(displayContent)
            .replace(/\s+/g, " ")
            .trim();

    return (
        <Link
            to={`/posts/${postId}`}
            className="post-card"
            aria-label={
                `${title} 게시글 상세 보기`
            }
        >
            <div className="post-card-content">
                <div className="post-card-top">
                    <div className="post-card-text">
                        <span className="post-card-badge">
                            {
                                BOARD_BADGES[
                                    post.boardType
                                ] ?? "POST"
                            }
                        </span>

                        <h2 className="post-card-title">
                            {title}
                        </h2>

                        {
                            showExcerpt &&
                            excerpt && (
                                <p className="post-card-excerpt">
                                    {excerpt}
                                </p>
                            )
                        }

                        <div className="post-card-stats">
                            <span>
                                좋아요{" "}
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
                                조회수{" "}
                                {
                                    formatCount(
                                        post.viewCount
                                    )
                                }
                            </span>
                        </div>

                        {
                            projectContent
                                ?.periodStart &&
                            projectContent
                                ?.periodEnd && (
                                <p className="post-card-period">
                                    모집 기간{" "}
                                    {
                                        projectContent
                                            .periodStart
                                    }
                                    {" ~ "}
                                    {
                                        projectContent
                                            .periodEnd
                                    }
                                </p>
                            )
                        }
                    </div>

                    {
                        thumbnail && (
                            <div className="post-thumbnail-wrapper">
                                <img
                                    className="post-thumbnail"
                                    src={thumbnail}
                                    alt=""
                                />
                            </div>
                        )
                    }
                </div>
            </div>

            <div className="post-card-writer">
                {
                    profileImage
                        ? (
                            <img
                                className="post-writer-image"
                                src={profileImage}
                                alt=""
                            />
                        )
                        : (
                            <span
                                className="post-writer-fallback"
                                aria-hidden="true"
                            >
                                {
                                    nickname
                                        .charAt(0)
                                        .toUpperCase()
                                }
                            </span>
                        )
                }

                <span className="post-writer-name">
                    {nickname}
                </span>

                <span className="post-created-at">
                    {
                        formatDate(
                            post.createdAt
                        )
                    }
                </span>
            </div>
        </Link>
    );
}

export default PostCard;
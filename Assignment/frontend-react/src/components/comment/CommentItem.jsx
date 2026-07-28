import {
    resolveAssetUrl
} from "../../utils/assetUrl.js";

import {
    formatDate
} from "../../utils/formatters.js";

function CommentItem({
    comment,
    currentUserId,
    onEdit,
    onDelete
}) {
    const commentUserId =
        Number(comment.userId);

    const isOwner =
        Number(currentUserId) ===
        commentUserId;

    const nickname =
        comment.nickname ?? "작성자";

    const profileImage =
        resolveAssetUrl(
            comment.profileImage
        );

    return (
        <article className="detail-comment-item">
            <div className="detail-comment-top">
                <div className="detail-comment-writer">
                    {
                        profileImage
                            ? (
                                <img
                                    className="
                                        detail-comment-writer-image
                                    "
                                    src={profileImage}
                                    alt=""
                                />
                            )
                            : (
                                <span
                                    className="
                                        detail-comment-writer-fallback
                                    "
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

                    <strong>{nickname}</strong>

                    <span className="detail-comment-date">
                        {formatDate(comment.createdAt)}
                    </span>
                </div>

                {
                    isOwner && (
                        <div className="detail-comment-actions">
                            <button
                                type="button"
                                onClick={function () {
                                    onEdit(comment);
                                }}
                            >
                                수정
                            </button>

                            <button
                                type="button"
                                onClick={function () {
                                    onDelete(comment);
                                }}
                            >
                                삭제
                            </button>
                        </div>
                    )
                }
            </div>

            <p className="detail-comment-content">
                {comment.content ?? ""}
            </p>
        </article>
    );
}

export default CommentItem;
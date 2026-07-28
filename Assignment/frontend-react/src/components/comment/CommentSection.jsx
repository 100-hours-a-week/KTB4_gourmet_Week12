import {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    createComment,
    deleteComment,
    getComments,
    updateComment
} from "../../api/commentApi.js";

import CommentItem from "./CommentItem.jsx";
import ConfirmModal from "../common/ConfirmModal.jsx";

function CommentSection({
    postId,
    currentUserId,
    onCommentCountChange
}) {
    const [
        comments,
        setComments
    ] = useState([]);

    const [
        draft,
        setDraft
    ] = useState("");

    const [
        editingCommentId,
        setEditingCommentId
    ] = useState(null);

    const [
        deletingComment,
        setDeletingComment
    ] = useState(null);

    const [
        isLoading,
        setIsLoading
    ] = useState(true);

    const [
        isSubmitting,
        setIsSubmitting
    ] = useState(false);

    const [
        isDeleting,
        setIsDeleting
    ] = useState(false);

    const [
        error,
        setError
    ] = useState("");

    const loadComments =
        useCallback(
            async function (signal) {
                try {
                    const data =
                        await getComments(
                            postId,
                            signal
                        );

                    setComments(data);
                    setError("");

                    onCommentCountChange(
                        data.length
                    );
                } catch (requestError) {
                    if (
                        requestError.name ===
                        "AbortError"
                    ) {
                        return;
                    }

                    console.error(
                        "댓글 목록 조회 오류:",
                        requestError
                    );

                    setError(
                        requestError?.message ??
                        "댓글을 불러오지 못했습니다."
                    );
                } finally {
                    setIsLoading(false);
                }
            },
            [
                postId,
                onCommentCountChange
            ]
        );

    useEffect(function () {
        const controller =
            new AbortController();

        setIsLoading(true);
        setComments([]);
        setDraft("");
        setEditingCommentId(null);
        setDeletingComment(null);

        loadComments(
            controller.signal
        );

        return function () {
            controller.abort();
        };
    }, [loadComments]);

    function handleEdit(comment) {
        setEditingCommentId(
            comment.id
        );

        setDraft(
            comment.content ?? ""
        );

        setError("");
    }

    function cancelEdit() {
        setEditingCommentId(null);
        setDraft("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const content =
            draft.trim();

        if (
            !content ||
            isSubmitting
        ) {
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            if (editingCommentId !== null) {
                await updateComment(
                    postId,
                    editingCommentId,
                    content
                );
            } else {
                await createComment(
                    postId,
                    {
                        userId:
                            Number(currentUserId),

                        content
                    }
                );
            }

            setDraft("");
            setEditingCommentId(null);

            await loadComments();
        } catch (requestError) {
            console.error(
                "댓글 저장 오류:",
                requestError
            );

            setError(
                requestError?.message ??
                "댓글 저장에 실패했습니다."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    async function confirmDeleteComment() {
        if (
            !deletingComment ||
            isDeleting
        ) {
            return;
        }

        setIsDeleting(true);
        setError("");

        try {
            await deleteComment(
                postId,
                deletingComment.id
            );

            setDeletingComment(null);

            if (
                editingCommentId ===
                deletingComment.id
            ) {
                cancelEdit();
            }

            await loadComments();
        } catch (requestError) {
            console.error(
                "댓글 삭제 오류:",
                requestError
            );

            setError(
                requestError?.message ??
                "댓글 삭제에 실패했습니다."
            );
        } finally {
            setIsDeleting(false);
        }
    }

    const canSubmit =
        draft.trim().length > 0 &&
        !isSubmitting;

    return (
        <>
            <section
                className="detail-comment-panel"
                aria-label="댓글"
            >
                <header className="detail-comment-panel-head">
                    <h2>댓글</h2>

                    <p>
                        서로의 생각을 남겨보세요.
                    </p>
                </header>

                <form
                    className="detail-comment-write-box"
                    onSubmit={handleSubmit}
                >
                    <label htmlFor="detail-comment-input">
                        {
                            editingCommentId !== null
                                ? "댓글 수정"
                                : "댓글 작성"
                        }
                    </label>

                    <textarea
                        id="detail-comment-input"
                        value={draft}
                        placeholder="생각을 남겨주세요."
                        maxLength={65535}
                        disabled={isSubmitting}
                        onChange={function (event) {
                            setDraft(
                                event.target.value
                            );
                        }}
                    />

                    <div className="detail-comment-button-row">
                        {
                            editingCommentId !== null && (
                                <button
                                    type="button"
                                    className="
                                        detail-comment-cancel-button
                                    "
                                    disabled={isSubmitting}
                                    onClick={cancelEdit}
                                >
                                    수정 취소
                                </button>
                            )
                        }

                        <button
                            type="submit"
                            className={
                                `detail-comment-submit-button ${
                                    canSubmit
                                        ? "active"
                                        : ""
                                }`
                            }
                            disabled={!canSubmit}
                        >
                            {
                                isSubmitting
                                    ? "저장 중"
                                    : editingCommentId !== null
                                        ? "댓글 수정"
                                        : "댓글 등록"
                            }
                        </button>
                    </div>
                </form>

                {
                    error && (
                        <p
                            className="detail-comment-error"
                            role="alert"
                        >
                            {error}
                        </p>
                    )
                }

                <div className="detail-comment-list">
                    {
                        isLoading && (
                            <p className="detail-comment-state">
                                댓글을 불러오는 중입니다.
                            </p>
                        )
                    }

                    {
                        !isLoading &&
                        comments.length === 0 && (
                            <p className="detail-comment-state">
                                아직 등록된 댓글이 없습니다.
                            </p>
                        )
                    }

                    {
                        comments.map(function (comment) {
                            return (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    currentUserId={
                                        currentUserId
                                    }
                                    onEdit={handleEdit}
                                    onDelete={
                                        setDeletingComment
                                    }
                                />
                            );
                        })
                    }
                </div>
            </section>

            <ConfirmModal
                isOpen={deletingComment !== null}
                title="댓글을 삭제하시겠습니까?"
                description="삭제한 내용은 복구할 수 없습니다."
                confirmLabel="삭제"
                isProcessing={isDeleting}
                onCancel={function () {
                    if (!isDeleting) {
                        setDeletingComment(null);
                    }
                }}
                onConfirm={
                    confirmDeleteComment
                }
            />
        </>
    );
}

export default CommentSection;
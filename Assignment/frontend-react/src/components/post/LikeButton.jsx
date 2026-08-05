import {
    useEffect,
    useState
} from "react";

import {
    addPostLike,
    getLikeStatus,
    removePostLike
} from "../../api/likeApi.js";

import {
    formatCount
} from "../../utils/formatters.js";

function LikeButton({
    postId,
    userId,
    initialCount
}) {
    const [
        liked,
        setLiked
    ] = useState(false);

    const [
        likeCount,
        setLikeCount
    ] = useState(
        Number(initialCount ?? 0)
    );

    const [
        isProcessing,
        setIsProcessing
    ] = useState(false);

    useEffect(function () {
        setLikeCount(
            Number(initialCount ?? 0)
        );
    }, [initialCount]);

    useEffect(function () {
        if (!postId || !userId) {
            return undefined;
        }

        const controller =
            new AbortController();

        async function loadLikeStatus() {
            try {
                const data =
                    await getLikeStatus(
                        postId,
                        controller.signal
                    );

                setLiked(
                    Boolean(data?.liked)
                );

                setLikeCount(
                    Number(
                        data?.likeCount ?? 0
                    )
                );
            } catch (error) {
                if (
                    error.name ===
                    "AbortError"
                ) {
                    return;
                }

                console.error(
                    "좋아요 상태 조회 오류:",
                    error
                );
            }
        }

        loadLikeStatus();

        return function () {
            controller.abort();
        };
    }, [
        postId,
        userId
    ]);

    async function handleLikeClick() {
        if (
            isProcessing
            || !postId
            || !userId
        ) {
            return;
        }

        setIsProcessing(true);

        try {
            /*
             * 현재 화면 상태에 따라 원하는 최종 상태를
             * 서버에 명확하게 요청한다.
             */
            const data =
                liked
                    ? await removePostLike(postId)
                    : await addPostLike(postId);

            setLiked(
                Boolean(data?.liked)
            );

            setLikeCount(
                Number(
                    data?.likeCount ?? 0
                )
            );
        } catch (error) {
            console.error(
                "좋아요 처리 오류:",
                error
            );

            alert(
                error?.message
                ?? "좋아요 처리에 실패했습니다."
            );

            /*
             * 요청 실패 시 화면 상태를 서버 기준으로
             * 다시 동기화한다.
             */
            try {
                const current =
                    await getLikeStatus(postId);

                setLiked(
                    Boolean(current?.liked)
                );

                setLikeCount(
                    Number(
                        current?.likeCount ?? 0
                    )
                );
            } catch (syncError) {
                console.error(
                    "좋아요 상태 재동기화 오류:",
                    syncError
                );
            }
        } finally {
            setIsProcessing(false);
        }
    }

    return (
        <button
            type="button"
            className={
                `detail-stat-box detail-like-button ${
                    liked
                        ? "active"
                        : ""
                }`
            }
            aria-label={
                liked
                    ? "좋아요 취소"
                    : "좋아요"
            }
            aria-pressed={liked}
            disabled={
                isProcessing
                || !userId
            }
            onClick={handleLikeClick}
        >
            <span
                className="detail-like-icon"
                aria-hidden="true"
            >
                {liked ? "♥" : "♡"}
            </span>

            <strong>
                {formatCount(likeCount)}
            </strong>

            <span>
                {
                    isProcessing
                        ? "처리 중"
                        : "좋아요"
                }
            </span>
        </button>
    );
}

export default LikeButton;
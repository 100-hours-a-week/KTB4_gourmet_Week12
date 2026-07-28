import {
    useEffect,
    useState
} from "react";

import {
    getLikeStatus,
    togglePostLike
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
                        userId,
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

    async function handleToggleLike() {
        if (
            isProcessing ||
            !postId ||
            !userId
        ) {
            return;
        }

        setIsProcessing(true);

        try {
            const data =
                await togglePostLike(
                    postId,
                    userId
                );

            setLiked(
                Boolean(data.liked)
            );

            setLikeCount(
                Number(data.likeCount ?? 0)
            );
        } catch (error) {
            console.error(
                "좋아요 처리 오류:",
                error
            );

            alert(
                error?.message ??
                "좋아요 처리에 실패했습니다."
            );
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
            disabled={isProcessing}
            onClick={handleToggleLike}
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

            <span>좋아요</span>
        </button>
    );
}

export default LikeButton;
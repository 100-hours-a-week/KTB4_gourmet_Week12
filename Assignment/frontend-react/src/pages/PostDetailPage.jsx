import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router";

import {
    deletePost,
    getPostDetail
} from "../api/postApi.js";

import CommentSection from
    "../components/comment/CommentSection.jsx";

import ConfirmModal from
    "../components/common/ConfirmModal.jsx";

import LikeButton from
    "../components/post/LikeButton.jsx";

import {
    getBoardConfig
} from "../constants/boards.js";

import useAuth from
    "../hooks/useAuth.js";

import {
    resolveAssetUrl
} from "../utils/assetUrl.js";

import {
    formatCount,
    formatDate
} from "../utils/formatters.js";

import {
    parseProjectContent
} from "../utils/projectContent.js";

import "../styles/post-detail.css";

function PostDetailPage() {
    const navigate =
        useNavigate();

    const {
        postId
    } = useParams();

    const {
        currentUser
    } = useAuth();

    const [
        post,
        setPost
    ] = useState(null);

    const [
        commentCount,
        setCommentCount
    ] = useState(0);

    const [
        isLoading,
        setIsLoading
    ] = useState(true);

    const [
        error,
        setError
    ] = useState("");

    const [
        isDeleteModalOpen,
        setIsDeleteModalOpen
    ] = useState(false);

    const [
        isDeleting,
        setIsDeleting
    ] = useState(false);

    const numericPostId =
        Number(postId);

useEffect(function () {
    if (
        !Number.isInteger(numericPostId)
        || numericPostId < 1
    ) {
        setError(
            "올바르지 않은 게시글 번호입니다."
        );

        setIsLoading(false);

        return undefined;
    }

    const controller =
        new AbortController();

    /*
     * abort() 이후 이미 실행 중이던 Promise의
     * finally가 상태를 바꾸지 못하게 한다.
     */
    let active = true;

    async function loadPostDetail() {
        setIsLoading(true);
        setError("");

        try {
            const data =
                await getPostDetail(
                    numericPostId,
                    controller.signal
                );

            if (!active) {
                return;
            }

            setPost(data);

            setCommentCount(
                Number(
                    data.commentCount ?? 0
                )
            );
        } catch (requestError) {
            if (
                !active
                || requestError.name
                    === "AbortError"
            ) {
                return;
            }

            console.error(
                "게시글 상세 조회 오류:",
                requestError
            );

            setError(
                requestError?.message
                ?? "게시글을 불러오지 못했습니다."
            );
        } finally {
            /*
             * 현재 활성 요청만 로딩 상태를 종료한다.
             */
            if (active) {
                setIsLoading(false);
            }
        }
    }

    loadPostDetail();

    return function () {
        active = false;
        controller.abort();
    };
}, [numericPostId]);

    useEffect(function () {
        if (post?.title) {
            document.title =
                `${post.title} · Gourmet Community`;
        }
    }, [post?.title]);

    const board =
        useMemo(
            function () {
                if (!post?.boardType) {
                    return null;
                }

                return getBoardConfig(
                    String(
                        post.boardType
                    ).toLowerCase()
                );
            },
            [post?.boardType]
        );

    const parsedProjectContent =
        useMemo(
            function () {
                if (
                    post?.boardType !==
                    "PROJECT"
                ) {
                    return null;
                }

                return parseProjectContent(
                    post.content
                );
            },
            [
                post?.boardType,
                post?.content
            ]
        );

    const isPostOwner =
        Number(currentUser?.id) ===
        Number(post?.userId);

    const writerProfileImage =
        resolveAssetUrl(
            post?.profileImage
        );

    const handleCommentCountChange =
        useCallback(
            function (nextCount) {
                setCommentCount(
                    Number(nextCount ?? 0)
                );
            },
            []
        );

    function handleBack() {
        if (board?.routeType) {
            navigate(
                `/boards/${board.routeType}`
            );

            return;
        }

        navigate(-1);
    }

    async function handleDeletePost() {
        if (
            !post ||
            !isPostOwner ||
            isDeleting
        ) {
            return;
        }

        setIsDeleting(true);

        try {
            await deletePost(
                numericPostId
            );

            setIsDeleteModalOpen(false);

            alert(
                "게시글이 삭제되었습니다."
            );

            navigate(
                board?.routeType
                    ? `/boards/${board.routeType}`
                    : "/boards/free",
                {
                    replace: true
                }
            );
        } catch (requestError) {
            console.error(
                "게시글 삭제 오류:",
                requestError
            );

            alert(
                requestError?.message ??
                "게시글 삭제에 실패했습니다."
            );
        } finally {
            setIsDeleting(false);
        }
    }

    if (isLoading) {
        return (
            <p className="detail-page-state">
                게시글을 불러오는 중입니다.
            </p>
        );
    }

    if (error || !post) {
        return (
            <section className="detail-page-error">
                <h1>게시글을 표시할 수 없습니다.</h1>

                <p>
                    {
                        error ||
                        "게시글을 찾을 수 없습니다."
                    }
                </p>

                <button
                    type="button"
                    onClick={handleBack}
                >
                    게시판으로 돌아가기
                </button>
            </section>
        );
    }

    const displayContent =
        parsedProjectContent
            ? parsedProjectContent.content
            : post.content;

    const imageUrls =
        Array.isArray(post.imageUrls)
            ? post.imageUrls
            : [];

    return (
        <>
            <div className="post-detail-page">
                <div className="post-detail-toolbar">
                    <button
                        type="button"
                        className="detail-back-button"
                        onClick={handleBack}
                    >
                        <span aria-hidden="true">
                            ‹
                        </span>

                        게시판으로
                    </button>
                </div>

                <article className="react-post-detail">
                    <header className="react-post-header">
                        <p className="react-detail-eyebrow">
                            {board?.eyebrow ?? "Post"}
                        </p>

                        <h1>{post.title}</h1>

                        {
                            parsedProjectContent
                                ?.periodStart &&
                            parsedProjectContent
                                ?.periodEnd && (
                                <p className="react-project-period">
                                    모집 기간{" "}
                                    {
                                        parsedProjectContent
                                            .periodStart
                                    }
                                    {" ~ "}
                                    {
                                        parsedProjectContent
                                            .periodEnd
                                    }
                                </p>
                            )
                        }

                        <div className="react-post-info-row">
                            <div className="react-writer-info">
                                {
                                    writerProfileImage
                                        ? (
                                            <img
                                                className="
                                                    react-writer-image
                                                "
                                                src={
                                                    writerProfileImage
                                                }
                                                alt=""
                                            />
                                        )
                                        : (
                                            <span
                                                className="
                                                    react-writer-fallback
                                                "
                                                aria-hidden="true"
                                            >
                                                {
                                                    (
                                                        post.nickname ??
                                                        "작"
                                                    )
                                                        .charAt(0)
                                                        .toUpperCase()
                                                }
                                            </span>
                                        )
                                }

                                <div className="react-writer-meta">
                                    <strong>
                                        {
                                            post.nickname ??
                                            "작성자"
                                        }
                                    </strong>

                                    <span>
                                        {
                                            formatDate(
                                                post.createdAt
                                            )
                                        }
                                    </span>
                                </div>
                            </div>

                            {
                                isPostOwner && (
                                    <div className="react-post-actions">
                                        <button
                                            type="button"
                                            onClick={function () {
                                                navigate(
                                                    `/posts/${numericPostId}/edit`
                                                );
                                            }}
                                        >
                                            수정
                                        </button>

                                        <button
                                            type="button"
                                            onClick={function () {
                                                setIsDeleteModalOpen(
                                                    true
                                                );
                                            }}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                )
                            }
                        </div>
                    </header>

                    <div className="react-post-body">
                        <p className="react-post-content">
                            {displayContent ?? ""}
                        </p>

                        {
                            imageUrls.length > 0 && (
                                <div className="react-post-image-list">
                                    {
                                        imageUrls.map(
                                            function (
                                                imageUrl,
                                                index
                                            ) {
                                                return (
                                                    <img
                                                        key={
                                                            `${imageUrl}-${index}`
                                                        }
                                                        className="
                                                            react-post-detail-image
                                                        "
                                                        src={
                                                            resolveAssetUrl(
                                                                imageUrl
                                                            )
                                                        }
                                                        alt={
                                                            `게시글 이미지 ${
                                                                index + 1
                                                            }`
                                                        }
                                                    />
                                                );
                                            }
                                        )
                                    }
                                </div>
                            )
                        }
                    </div>

                    <div
                        className="react-post-stats"
                        aria-label="게시글 반응"
                    >
                        <LikeButton
                            postId={numericPostId}
                            userId={currentUser?.id}
                            initialCount={
                                post.likeCount
                            }
                        />

                        <div className="detail-stat-box">
                            <strong>
                                {
                                    formatCount(
                                        post.viewCount
                                    )
                                }
                            </strong>

                            <span>조회</span>
                        </div>

                        <div className="detail-stat-box">
                            <strong>
                                {
                                    formatCount(
                                        commentCount
                                    )
                                }
                            </strong>

                            <span>댓글</span>
                        </div>
                    </div>
                </article>

                <CommentSection
                    postId={numericPostId}
                    currentUserId={
                        currentUser?.id
                    }
                    onCommentCountChange={
                        handleCommentCountChange
                    }
                />
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="게시글을 삭제하시겠습니까?"
                description="삭제한 내용은 복구할 수 없습니다."
                confirmLabel="삭제"
                isProcessing={isDeleting}
                onCancel={function () {
                    if (!isDeleting) {
                        setIsDeleteModalOpen(
                            false
                        );
                    }
                }}
                onConfirm={handleDeletePost}
            />
        </>
    );
}

export default PostDetailPage;
import {
    useEffect,
    useState
} from "react";

import {
    Navigate,
    useNavigate,
    useParams
} from "react-router";

import {
    getPostDetail,
    updatePost
} from "../api/postApi.js";

import PostForm from
    "../components/post/PostForm.jsx";

import {
    getBoardConfig
} from "../constants/boards.js";

import useAuth from
    "../hooks/useAuth.js";

import {
    buildProjectContent,
    parseProjectContent
} from "../utils/projectContent.js";

function PostEditPage() {
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
        isLoading,
        setIsLoading
    ] = useState(true);

    const [
        error,
        setError
    ] = useState("");

    const numericPostId =
        Number(postId);

    useEffect(function () {
        if (
            !Number.isInteger(numericPostId) ||
            numericPostId < 1
        ) {
            setError(
                "올바르지 않은 게시글 번호입니다."
            );

            setIsLoading(false);
            return undefined;
        }

        const controller =
            new AbortController();

        async function loadPost() {
            setIsLoading(true);
            setError("");

            try {
                const data =
                    await getPostDetail(
                        numericPostId,
                        controller.signal
                    );

                setPost(data);
            } catch (requestError) {
                if (
                    requestError.name ===
                    "AbortError"
                ) {
                    return;
                }

                console.error(
                    "수정할 게시글 조회 오류:",
                    requestError
                );

                setError(
                    requestError?.message ??
                    "게시글을 불러오지 못했습니다."
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadPost();

        return function () {
            controller.abort();
        };
    }, [numericPostId]);

    useEffect(function () {
        if (post?.title) {
            document.title =
                `${post.title} 수정 · Gourmet Community`;
        }
    }, [post?.title]);

    if (isLoading) {
        return (
            <main className="post-form-page-state">
                수정할 게시글을 불러오는 중입니다.
            </main>
        );
    }

    if (error || !post) {
        return (
            <section className="post-form-page-error">
                <h1>
                    게시글을 수정할 수 없습니다.
                </h1>

                <p>
                    {
                        error ||
                        "게시글을 찾을 수 없습니다."
                    }
                </p>

                <button
                    type="button"
                    onClick={function () {
                        navigate(
                            "/boards/free"
                        );
                    }}
                >
                    게시판으로 이동
                </button>
            </section>
        );
    }

    const isOwner =
        Number(currentUser?.id) ===
        Number(post.userId);

    if (!isOwner) {
        return (
            <Navigate
                to={`/posts/${numericPostId}`}
                replace
            />
        );
    }

    const routeBoardType =
        String(
            post.boardType ?? "FREE"
        ).toLowerCase();

    const board =
        getBoardConfig(
            routeBoardType
        );

    const isProject =
        post.boardType === "PROJECT";

    const parsedProject =
        isProject
            ? parseProjectContent(
                post.content
            )
            : null;

    const initialValues = {
        title:
            post.title ?? "",

        content:
            parsedProject
                ? parsedProject.content
                : post.content ?? "",

        periodStart:
            parsedProject?.periodStart ?? "",

        periodEnd:
            parsedProject?.periodEnd ?? ""
    };

    async function handleUpdate({
        title,
        content,
        periodStart,
        periodEnd,
        images
    }) {
        const updatedContent =
            isProject
                ? buildProjectContent(
                    periodStart,
                    periodEnd,
                    content
                )
                : content;

        await updatePost({
            postId:
                numericPostId,

            title,

            content:
                updatedContent,

            images
        });

        alert(
            isProject
                ? "프로젝트 모집 글이 수정되었습니다."
                : "게시글이 수정되었습니다."
        );

        navigate(
            `/posts/${numericPostId}`,
            {
                replace: true
            }
        );
    }

    function handleCancel() {
        navigate(
            `/posts/${numericPostId}`
        );
    }

    return (
        <PostForm
            eyebrow={
                isProject
                    ? "Edit Project Recruit"
                    : `Edit ${board?.eyebrow ?? "Post"}`
            }
            heading={
                isProject
                    ? "프로젝트 모집 수정"
                    : "게시글 수정"
            }
            description={
                isProject
                    ? "모집 기간과 프로젝트 내용을 수정합니다."
                    : "작성한 게시글의 제목, 내용, 이미지를 수정합니다."
            }
            titleLabel={
                isProject
                    ? "프로젝트 제목"
                    : "제목"
            }
            titlePlaceholder="제목을 입력해주세요. (최대 26자)"
            contentLabel={
                isProject
                    ? "모집 내용"
                    : "내용"
            }
            contentPlaceholder="내용을 입력해주세요."
            submitLabel="수정 완료"
            showProjectPeriod={
                isProject
            }
            initialValues={
                initialValues
            }
            existingImageUrls={
                post.imageUrls ?? []
            }
            onSubmit={
                handleUpdate
            }
            onCancel={
                handleCancel
            }
        />
    );
}

export default PostEditPage;
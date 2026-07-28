import { useEffect } from "react";

import {
    Navigate,
    useNavigate,
    useSearchParams
} from "react-router";

import {
    createPost
} from "../api/postApi.js";

import PostForm from
    "../components/post/PostForm.jsx";

import useAuth from
    "../hooks/useAuth.js";

const POST_CREATE_CONFIG = {
    free: {
        apiType: "FREE",
        eyebrow: "Free Board",
        heading: "자유 게시글 작성",
        description:
            "자유롭게 이야기를 남겨보세요.",
        titleLabel: "제목",
        titlePlaceholder:
            "제목을 입력해주세요. (최대 26자)",
        contentLabel: "내용",
        contentPlaceholder:
            "내용을 입력해주세요.",
        submitLabel: "게시글 등록"
    },

    question: {
        apiType: "QUESTION",
        eyebrow: "Q & A",
        heading: "질문 등록",
        description:
            "막힌 지점과 시도한 내용을 함께 적어주세요.",
        titleLabel: "질문 제목",
        titlePlaceholder:
            "질문 제목을 입력해주세요. (최대 26자)",
        contentLabel: "질문 내용",
        contentPlaceholder:
            "질문 내용, 시도한 방법, 에러 메시지 등을 적어주세요.",
        submitLabel: "질문 등록"
    },

    study: {
        apiType: "STUDY",
        eyebrow: "Study Journal",
        heading: "학습 기록 작성",
        description:
            "오늘의 배움을 일지처럼 남겨보세요.",
        titleLabel: "기록 제목",
        titlePlaceholder:
            "학습 기록 제목을 입력해주세요. (최대 26자)",
        contentLabel: "학습 내용",
        contentPlaceholder:
            "오늘 배운 것, 느낀 점, 다음에 할 일을 적어주세요.",
        submitLabel: "기록 등록"
    }
};

function PostCreatePage() {
    const navigate =
        useNavigate();

    const [
        searchParams
    ] = useSearchParams();

    const {
        currentUser
    } = useAuth();

    const requestedBoardType =
        (
            searchParams.get("board") ||
            "free"
        ).toLowerCase();

    const config =
        POST_CREATE_CONFIG[
            requestedBoardType
        ] ?? null;

    useEffect(function () {
        if (config?.heading) {
            document.title =
                `${config.heading} · Gourmet Community`;
        }
    }, [config?.heading]);

    if (
        requestedBoardType ===
        "project"
    ) {
        return (
            <Navigate
                to="/projects/new"
                replace
            />
        );
    }

    if (!config) {
        return (
            <Navigate
                to="/posts/new?board=free"
                replace
            />
        );
    }

    async function handleCreatePost({
        title,
        content,
        images
    }) {
        await createPost({
            userId:
                currentUser?.id,

            title,
            content,

            boardType:
                config.apiType,

            images
        });

        alert(
            "게시글이 작성되었습니다."
        );

        navigate(
            `/boards/${requestedBoardType}`,
            {
                replace: true
            }
        );
    }

    function handleCancel() {
        navigate(
            `/boards/${requestedBoardType}`
        );
    }

    return (
        <PostForm
            eyebrow={config.eyebrow}
            heading={config.heading}
            description={
                config.description
            }
            titleLabel={
                config.titleLabel
            }
            titlePlaceholder={
                config.titlePlaceholder
            }
            contentLabel={
                config.contentLabel
            }
            contentPlaceholder={
                config.contentPlaceholder
            }
            submitLabel={
                config.submitLabel
            }
            onSubmit={handleCreatePost}
            onCancel={handleCancel}
        />
    );
}

export default PostCreatePage;
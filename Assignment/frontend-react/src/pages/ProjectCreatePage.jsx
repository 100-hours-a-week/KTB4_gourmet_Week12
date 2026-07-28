import { useEffect } from "react";

import {
    useNavigate
} from "react-router";

import {
    createPost
} from "../api/postApi.js";

import PostForm from
    "../components/post/PostForm.jsx";

import useAuth from
    "../hooks/useAuth.js";

import {
    buildProjectContent
} from "../utils/projectContent.js";

function ProjectCreatePage() {
    const navigate =
        useNavigate();

    const {
        currentUser
    } = useAuth();

    useEffect(function () {
        document.title =
            "프로젝트 모집 작성 · Gourmet Community";
    }, []);

    async function handleCreateProject({
        title,
        content,
        periodStart,
        periodEnd,
        images
    }) {
        const projectContent =
            buildProjectContent(
                periodStart,
                periodEnd,
                content
            );

        await createPost({
            userId:
                currentUser?.id,

            title,

            content:
                projectContent,

            boardType:
                "PROJECT",

            images
        });

        alert(
            "프로젝트 모집 글이 등록되었습니다."
        );

        navigate(
            "/boards/project",
            {
                replace: true
            }
        );
    }

    function handleCancel() {
        navigate(
            "/boards/project"
        );
    }

    return (
        <PostForm
            eyebrow="Project Recruit"
            heading="프로젝트 모집 작성"
            description={
                "모집 기간과 함께 팀원을 찾아보세요."
            }
            titleLabel="프로젝트 제목"
            titlePlaceholder={
                "프로젝트 제목을 입력해주세요. (최대 26자)"
            }
            contentLabel="모집 내용"
            contentPlaceholder={
                "프로젝트 소개, 모집 인원, 기술 스택, 진행 방식 등을 적어주세요."
            }
            submitLabel="모집 등록"
            showProjectPeriod
            onSubmit={
                handleCreateProject
            }
            onCancel={handleCancel}
        />
    );
}

export default ProjectCreatePage;
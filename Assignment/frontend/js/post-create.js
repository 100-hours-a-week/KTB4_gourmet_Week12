const backButton = document.querySelector("#back-button");

const postCreateForm = document.querySelector("#post-create-form");
const titleInput = document.querySelector("#title");
const contentInput = document.querySelector("#content");
const imageInput = document.querySelector("#post-image");
const fileName = document.querySelector("#file-name");

const helperText = document.querySelector("#form-helper");
const submitButton = document.querySelector("#submit-button");
const formEyebrow = document.querySelector("#form-eyebrow");
const formTitle = document.querySelector("#form-title");
const formDesc = document.querySelector("#form-desc");

const boardParams = new URLSearchParams(window.location.search);
const requestedBoardType = (boardParams.get("board") || "free").toLowerCase();

if (requestedBoardType === "project") {
    window.location.replace("./project-create.html");
}

const BOARD_TYPE_VALUES = {
    free: "FREE",
    question: "QUESTION",
    study: "STUDY"
};

const boardType =
    Object.prototype.hasOwnProperty.call(
        BOARD_TYPE_VALUES,
        requestedBoardType
    )
        ? requestedBoardType
        : "free";

const apiBoardType = BOARD_TYPE_VALUES[boardType];

const BOARD_COPY = {
    free: {
        eyebrow: "Free Board",
        title: "자유 게시글 작성",
        desc: "자유롭게 이야기를 남겨보세요.",
        contentPlaceholder: "내용을 입력해주세요."
    },
    question: {
        eyebrow: "Q & A",
        title: "질문 등록",
        desc: "막힌 지점과 시도한 내용을 함께 적어주세요.",
        contentPlaceholder: "질문 내용, 시도한 방법, 에러 메시지 등을 적어주세요."
    },
    study: {
        eyebrow: "Study Journal",
        title: "학습 기록 작성",
        desc: "오늘의 배움을 일지처럼 남겨보세요.",
        contentPlaceholder: "오늘 배운 것, 느낀 점, 다음에 할 일을 적어주세요."
    }
};

const copy = BOARD_COPY[boardType];

if (formEyebrow) {
    formEyebrow.textContent = copy.eyebrow;
}

if (formTitle) {
    formTitle.textContent = copy.title;
}

if (formDesc) {
    formDesc.textContent = copy.desc;
}

if (contentInput) {
    contentInput.placeholder = copy.contentPlaceholder;
}

document.title = `${copy.title} · Gourmet Community`;

function safeExtractPostId(post) {
    if (typeof extractPostId === "function") {
        return extractPostId(post);
    }

    return (
        post?.postId ??
        post?.id ??
        post?.data?.postId ??
        post?.data?.id ??
        null
    );
}

function safeGetBoardPage(type) {
    if (typeof getBoardPage === "function") {
        return getBoardPage(type);
    }

    const pages = {
        free: "./posts.html",
        question: "./question.html",
        study: "./study.html"
    };

    return pages[type] || pages.free;
}

function validatePostForm() {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    helperText.textContent = "";

    if (title.length > 0 && content.length > 0) {
        submitButton.disabled = false;
        submitButton.classList.add("active");
        return true;
    }

    submitButton.disabled = true;
    submitButton.classList.remove("active");
    return false;
}

titleInput.addEventListener("input", function () {
    if (titleInput.value.length > 26) {
        titleInput.value = titleInput.value.slice(0, 26);
    }

    validatePostForm();
});

contentInput.addEventListener("input", validatePostForm);

imageInput.addEventListener("change", function () {
    const files = Array.from(imageInput.files);

    if (files.length === 0) {
        fileName.textContent = "파일을 선택해주세요.";
        return;
    }

    if (files.length === 1) {
        fileName.textContent = files[0].name;
        return;
    }

    fileName.textContent =
        `${files[0].name} 외 ${files.length - 1}개`;

    console.log("이미지 선택:", files);
});

postCreateForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const isValid = validatePostForm();

    if (!isValid) {
        helperText.textContent = "* 제목, 내용을 모두 작성해주세요.";
        return;
    }

    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("로그인이 필요합니다.");
        window.location.href = "./login.html";
        return;
    }

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    try {
        const formData = new FormData();

        formData.append("title", title);
        formData.append("content", content);
        formData.append("boardType", apiBoardType);

        if (imageInput.files.length > 0) {
            Array.from(imageInput.files).forEach(function (image) {
                formData.append("images", image);
            });
        }

        const post = await apiFetch(`/users/${userId}/posts`, {
            method: "POST",
            body: formData
        });

        if (!post) {
            return;
        }

        console.log("게시글 작성 성공:", post);

        const postId = safeExtractPostId(post);

        if (postId != null) {
            localStorage.setItem(
                "selectedPostId",
                String(postId)
            );
        } else {
            console.warn(
                "작성 응답에서 postId를 찾지 못했습니다:",
                post
            );
        }

        alert("게시글이 작성되었습니다.");
        window.location.href = safeGetBoardPage(boardType);
    } catch (error) {
        console.error("게시글 작성 요청 오류:", error);

        helperText.textContent =
            `* ${error?.message ?? "게시글 작성에 실패했습니다."}`;
    }
});

backButton.addEventListener("click", function () {
    window.location.href = safeGetBoardPage(boardType);
});
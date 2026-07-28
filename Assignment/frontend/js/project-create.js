const backButton = document.querySelector("#back-button");

const projectCreateForm = document.querySelector("#project-create-form");
const titleInput = document.querySelector("#title");
const contentInput = document.querySelector("#content");
const periodStartInput = document.querySelector("#period-start");
const periodEndInput = document.querySelector("#period-end");
const imageInput = document.querySelector("#post-image");
const fileName = document.querySelector("#file-name");

const helperText = document.querySelector("#form-helper");
const submitButton = document.querySelector("#submit-button");

function validateProjectForm() {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const periodStart = periodStartInput.value;
    const periodEnd = periodEndInput.value;

    helperText.textContent = "";

    const hasPeriod = periodStart && periodEnd;
    const validRange = hasPeriod && periodStart <= periodEnd;

    if (title.length > 0 && content.length > 0 && validRange) {
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

    validateProjectForm();
});

contentInput.addEventListener("input", validateProjectForm);
periodStartInput.addEventListener("change", validateProjectForm);
periodEndInput.addEventListener("change", validateProjectForm);

imageInput.addEventListener("change", function () {
    const file = imageInput.files[0];

    if (!file) {
        fileName.textContent = "파일을 선택해주세요.";
        return;
    }

    fileName.textContent = file.name;
});

projectCreateForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const periodStart = periodStartInput.value;
    const periodEnd = periodEndInput.value;

    if (!title || !content) {
        helperText.textContent = "* 제목, 내용을 모두 작성해주세요.";
        return;
    }

    if (!periodStart || !periodEnd) {
        helperText.textContent = "* 모집 기간을 입력해주세요.";
        return;
    }

    if (periodStart > periodEnd) {
        helperText.textContent = "* 모집 종료일은 시작일 이후여야 합니다.";
        return;
    }

    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("로그인이 필요합니다.");
        window.location.href = "./login.html";
        return;
    }

    try {
        const formData = new FormData();
        const fullContent = buildProjectContent(periodStart, periodEnd, content);

        formData.append("title", title);
        formData.append("content", fullContent);
        formData.append("boardType", "PROJECT");

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

        const postId =
            (typeof extractPostId === "function" ? extractPostId(post) : null) ??
            post.postId ??
            post.id;

        if (postId) {
            localStorage.setItem("selectedPostId", postId);

            
            setProjectMeta(postId, {
                periodStart: periodStart,
                periodEnd: periodEnd
            });
        } else {
            console.warn("작성 응답에서 postId를 찾지 못했습니다:", post);
        }

        alert("프로젝트 모집 글이 등록되었습니다.");
        window.location.href = "./project.html";
    } catch (error) {
        console.error("프로젝트 모집 작성 오류:", error);
        helperText.textContent = `* ${error?.message ?? "작성에 실패했습니다."}`;
    }
});

backButton.addEventListener("click", function () {
    window.location.href = "./project.html";
});

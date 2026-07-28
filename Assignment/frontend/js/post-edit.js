const backButton = document.querySelector("#back-button");
const postEditForm = document.querySelector("#post-edit-form");
const titleInput = document.querySelector("#title");
const contentInput = document.querySelector("#content");
const imageInput = document.querySelector("#post-image");
const fileName = document.querySelector("#file-name");

const helperText = document.querySelector("#form-helper");
const submitButton = document.querySelector("#submit-button");

let selectedImage = null;

function getLoginUserId() {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        return null;
    }

    return Number(userId);
}

function isOwner(ownerUserId) {
    const loginUserId = getLoginUserId();

    if (!loginUserId || !ownerUserId) {
        return false;
    }

    return Number(ownerUserId) === loginUserId;
}

function validateEditForm() {
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

function getSelectedPostId() {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get("postId");

    if (postId) {
        return postId;
    }

    return localStorage.getItem("selectedPostId");
}

async function fetchPostForEdit() {
    const postId = getSelectedPostId();

    if (!postId) {
        alert("선택된 게시글이 없습니다.");
        window.location.href = "./posts.html";
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}`);

        if (!response.ok) {
            throw new Error("게시글 조회 실패");
        }

        const post = await response.json();

        console.log("수정용 게시글 조회 성공:", post);

        const postOwnerId = post.userId ?? post.authorId;

        if (!isOwner(postOwnerId)) {
            alert("작성자만 수정할 수 있습니다.");
            window.location.href = `./post-detail.html?postId=${postId}`;
            return;
        }

        titleInput.value = post.title ?? "";
        contentInput.value = post.content ?? "";

        if (fileName) {
            if (post.imageUrls && post.imageUrls.length > 0) {
                fileName.textContent = "기존 이미지가 있습니다.";
            } else {
                fileName.textContent = "기존 이미지 없음";
            }
        }

        validateEditForm();
    } catch (error) {
        console.error(error);
        alert("게시글을 불러오지 못했습니다.");
        window.location.href = "./posts.html";
    }
}

titleInput.addEventListener("input", function () {
    if (titleInput.value.length > 26) {
        titleInput.value = titleInput.value.slice(0, 26);
    }

    validateEditForm();
});

contentInput.addEventListener("input", validateEditForm);

if (imageInput) {
    imageInput.addEventListener("change", function () {
        if (!imageInput.files || imageInput.files.length === 0) {
            selectedImage = null;

            if (fileName) {
                fileName.textContent = "기존 이미지를 유지합니다.";
            }

            return;
        }

        selectedImage = imageInput.files[0];

        const names = Array.from(imageInput.files)
            .map(function (file) {
                return file.name;
            })
            .join(", ");

        if (fileName) {
            fileName.textContent = names;
        }

        console.log("수정 이미지 선택:", selectedImage);
    });
}

postEditForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const isValid = validateEditForm();

    if (!isValid) {
        helperText.textContent = "* 제목, 내용을 모두 작성해주세요.";
        return;
    }

    const postId = getSelectedPostId();

    if (!postId) {
        alert("선택된 게시글이 없습니다.");
        window.location.href = "./posts.html";
        return;
    }

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    try {
        const formData = new FormData();

        formData.append("title", title);
        formData.append("content", content);

        if (imageInput && imageInput.files.length > 0) {
            Array.from(imageInput.files).forEach(function (image) {
                formData.append("images", image);
            });
        }

        const updatedPost = await apiFetch(`/posts/${postId}`, {
            method: "PATCH",
            body: formData
        });

        console.log("게시글 수정 성공:", updatedPost);

        alert("게시글이 수정되었습니다.");
        window.location.href = `./post-detail.html?postId=${postId}`;
    } catch (error) {
        console.error("게시글 수정 요청 오류:", error);
        helperText.textContent = `* ${error?.message ?? "게시글 수정에 실패했습니다."}`;
    }
});

backButton.addEventListener("click", function () {
    const postId = getSelectedPostId();

    if (!postId) {
        window.location.href = "./posts.html";
        return;
    }

    window.location.href = `./post-detail.html?postId=${postId}`;
});

fetchPostForEdit();
validateEditForm();
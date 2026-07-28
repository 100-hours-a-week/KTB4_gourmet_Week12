const backButton = document.querySelector("#back-button");

const postEditButton = document.querySelector("#post-edit-button");
const postDeleteButton = document.querySelector("#post-delete-button");

const postDeleteModal = document.querySelector("#post-delete-modal");
const postDeleteCancel = document.querySelector("#post-delete-cancel");
const postDeleteConfirm = document.querySelector("#post-delete-confirm");

const commentDeleteModal = document.querySelector("#comment-delete-modal");
const commentDeleteCancel = document.querySelector("#comment-delete-cancel");
const commentDeleteConfirm = document.querySelector("#comment-delete-confirm");

const likeButton = document.querySelector("#like-button");
const likeCountElement = document.querySelector("#like-count");
const commentCountElement = document.querySelector("#comment-count");

const commentInput = document.querySelector("#comment-input");
const commentSubmitButton = document.querySelector("#comment-submit-button");
const commentList = document.querySelector("#comment-list");

const commentEditCancelButton = document.createElement("button");

commentEditCancelButton.type = "button";
commentEditCancelButton.className = "comment-edit-cancel-button";
commentEditCancelButton.textContent = "수정 취소";
commentEditCancelButton.style.display = "none";

commentSubmitButton.insertAdjacentElement("afterend", commentEditCancelButton);

let isLiked = false;
let currentLikeCount = 0;

let comments = [];

let editingCommentId = null;
let deletingCommentId = null;
let currentPostOwnerId = null;
let currentBoardType = "free";

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

function getSelectedPostId() {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get("postId");

    if (postId) {
        return postId;
    }

    return localStorage.getItem("selectedPostId");
}

function formatCount(count) {
    if (!count) {
        return 0;
    }

    if (count >= 1000) {
        return Math.floor(count / 1000) + "k";
    }

    return count;
}

function formatDate(dateValue) {
    if (!dateValue) {
        return "";
    }

    return String(dateValue).replace("T", " ").slice(0, 19);
}

function openModal(modal) {
    modal.classList.add("show");
    document.body.classList.add("modal-open");
}

function closeModal(modal) {
    modal.classList.remove("show");
    document.body.classList.remove("modal-open");
}

function getLikeIconElement() {
    let likeIcon = likeButton.querySelector(".like-icon");

    if (!likeIcon) {
        likeIcon = document.createElement("span");
        likeIcon.className = "like-icon";
        likeButton.prepend(likeIcon);
    }

    return likeIcon;
}

function updateLikeUi() {
    if (likeCountElement) {
        likeCountElement.textContent = formatCount(currentLikeCount);
    }

    if (!likeButton) {
        return;
    }

    const likeIcon = getLikeIconElement();

    if (isLiked) {
        likeButton.classList.add("active");
        likeIcon.textContent = "♥";
        likeButton.setAttribute("aria-label", "좋아요 취소");
    } else {
        likeButton.classList.remove("active");
        likeIcon.textContent = "♡";
        likeButton.setAttribute("aria-label", "좋아요");
    }
}

async function fetchLikeStatus() {
    const postId = getSelectedPostId();
    const userId = getLoginUserId();

    if (!postId || !userId) {
        isLiked = false;
        updateLikeUi();
        return;
    }

    try {
        const data = await apiFetch(`/posts/${postId}/likes/users/${userId}`);

        if (!data) {
            updateLikeUi();
            return;
        }

        isLiked = data.liked ?? false;
        currentLikeCount = data.likeCount ?? currentLikeCount;

        updateLikeUi();
    } catch (error) {
        console.error("좋아요 상태 조회 오류:", error);
        updateLikeUi();
    }
}

async function toggleLike() {
    const postId = getSelectedPostId();
    const userId = getLoginUserId();

    if (!postId) {
        alert("선택된 게시글이 없습니다.");
        window.location.href = "./posts.html";
        return;
    }

    if (!userId) {
        alert("로그인이 필요합니다.");
        window.location.href = "./login.html";
        return;
    }

    try {
        const data = await apiFetch(`/posts/${postId}/likes/users/${userId}`, {
            method: "POST"
        });

        if (!data) {
            return;
        }

        isLiked = data.liked;
        currentLikeCount = data.likeCount;

        updateLikeUi();

        console.log("좋아요 처리 성공:", data);
    } catch (error) {
        console.error("좋아요 요청 오류:", error);
        alert(error?.message ?? "좋아요 처리에 실패했습니다.");
    }
}

function updateCommentSubmitButton() {
    const commentText = commentInput.value.trim();

    if (commentText.length > 0) {
        commentSubmitButton.disabled = false;
        commentSubmitButton.classList.add("active");
    } else {
        commentSubmitButton.disabled = true;
        commentSubmitButton.classList.remove("active");
    }
}

function enterCommentEditMode(commentId, content) {
    editingCommentId = commentId;
    commentInput.value = content;
    commentSubmitButton.textContent = "댓글 수정";
    commentEditCancelButton.style.display = "inline-flex";

    updateCommentSubmitButton();

    commentInput.focus();
}

function resetCommentEditMode() {
    editingCommentId = null;
    commentInput.value = "";
    commentSubmitButton.textContent = "댓글 등록";
    commentEditCancelButton.style.display = "none";

    updateCommentSubmitButton();
}

function updateCommentCount() {
    commentCountElement.textContent = formatCount(comments.length);
}

function getCommentUserId(comment) {
    return comment.userId ?? comment.authorId;
}

function getCommentId(comment) {
    return comment.commentId ?? comment.id;
}

function getCommentWriter(comment) {
    return (
        comment.nickname ??
        comment.writer ??
        comment.writerName ??
        comment.authorNickname ??
        "작성자"
    );
}

function getCommentContent(comment) {
    return comment.content ?? "";
}

function getCommentCreatedAt(comment) {
    return formatDate(comment.createdAt);
}

function createCommentElement(comment) {
    const commentItem = document.createElement("article");
    commentItem.className = "comment-item";

    const commentId = getCommentId(comment);
    const commentOwnerId = getCommentUserId(comment);

    commentItem.dataset.commentId = commentId;

    const commentTop = document.createElement("div");
    commentTop.className = "comment-top";

    const commentWriter = document.createElement("div");
    commentWriter.className = "comment-writer";

    const commentWriterImage = document.createElement("div");
    commentWriterImage.className = "writer-image";

    if (comment.profileImage) {
        commentWriterImage.style.backgroundImage = `url(${API_BASE_URL}${comment.profileImage})`;
        commentWriterImage.style.backgroundSize = "cover";
        commentWriterImage.style.backgroundPosition = "center";
    }

    const writerName = document.createElement("strong");
    writerName.textContent = getCommentWriter(comment);

    const commentDate = document.createElement("span");
    commentDate.className = "comment-date";
    commentDate.textContent = getCommentCreatedAt(comment);

    commentWriter.appendChild(commentWriterImage);
    commentWriter.appendChild(writerName);
    commentWriter.appendChild(commentDate);

    const commentActions = document.createElement("div");
    commentActions.className = "comment-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "comment-edit-button";
    editButton.textContent = "수정";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "comment-delete-button";
    deleteButton.textContent = "삭제";

    commentActions.appendChild(editButton);
    commentActions.appendChild(deleteButton);

    if (!isOwner(commentOwnerId)) {
        commentActions.style.display = "none";
    }

    commentTop.appendChild(commentWriter);
    commentTop.appendChild(commentActions);

    const commentContent = document.createElement("p");
    commentContent.className = "comment-content";
    commentContent.textContent = getCommentContent(comment);

    commentItem.appendChild(commentTop);
    commentItem.appendChild(commentContent);

    editButton.addEventListener("click", function () {
        enterCommentEditMode(commentId, getCommentContent(comment));

        console.log("댓글 수정 클릭:", commentId);
    });

    deleteButton.addEventListener("click", function () {
        deletingCommentId = commentId;
        openModal(commentDeleteModal);

        console.log("댓글 삭제 클릭:", commentId);
    });

    return commentItem;
}

function renderComments() {
    commentList.replaceChildren();

    comments.forEach(function (comment) {
        const commentElement = createCommentElement(comment);
        commentList.appendChild(commentElement);
    });

    updateCommentCount();
}

async function fetchComments() {
    const postId = getSelectedPostId();

    if (!postId) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);

        if (!response.ok) {
            throw new Error("댓글 목록 조회 실패");
        }

        comments = await response.json();

        console.log("댓글 목록 조회 성공:", comments);

        renderComments();
    } catch (error) {
        console.error(error);
    }
}

function renderPostDetail(post) {
    const postTitle = document.querySelector("#post-title");
    const writerName = document.querySelector("#writer-name");
    const createdAt = document.querySelector("#created-at");
    const postContent = document.querySelector("#post-content");
    const viewCount = document.querySelector("#view-count");
    const commentCount = document.querySelector("#comment-count");
    const postActions = document.querySelector(".post-actions");
    const postImageList = document.querySelector("#post-image-list");
    const writerImage = document.querySelector(".writer-image");
    const detailEyebrow = document.querySelector("#detail-eyebrow");
    const projectPeriod = document.querySelector("#project-period");

    const postId = post.postId ?? post.id;
    currentBoardType = String(
        post.boardType ?? "FREE"
    ).toLowerCase();
    
    const boardEyebrows = {
        free: "Free Board",
        question: "Q & A",
        study: "Study Journal",
        project: "Project Recruit"
    };

    if (detailEyebrow) {
        detailEyebrow.textContent = boardEyebrows[currentBoardType] || "Post";
    }

    postTitle.textContent = post.title ?? "제목 없음";

    let displayContent = post.content ?? "";

    if (projectPeriod) {
        if (currentBoardType === "project") {
            const parsed = parseProjectContent(displayContent);
            const meta = getProjectMeta(postId);
            const periodStart = meta?.periodStart || parsed.periodStart;
            const periodEnd = meta?.periodEnd || parsed.periodEnd;

            if (periodStart && periodEnd) {
                projectPeriod.hidden = false;
                projectPeriod.textContent = "모집 기간 " + periodStart + " ~ " + periodEnd;
                displayContent = parsed.content || displayContent;
            } else {
                projectPeriod.hidden = true;
            }
        } else {
            projectPeriod.hidden = true;
        }
    }

    postContent.textContent = displayContent;

    if (writerImage && post.profileImage) {
        writerImage.style.backgroundImage = `url(${API_BASE_URL}${post.profileImage})`;
        writerImage.style.backgroundSize = "cover";
        writerImage.style.backgroundPosition = "center";
    }

    if (postImageList) {
        postImageList.replaceChildren();

        if (post.imageUrls && post.imageUrls.length > 0) {
            post.imageUrls.forEach(function (imageUrl) {
                const image = document.createElement("img");

                image.src = `${API_BASE_URL}${imageUrl}`;
                image.alt = "게시글 이미지";
                image.className = "post-detail-image";

                postImageList.appendChild(image);
            });
        }
    }

    writerName.textContent =
        post.nickname ??
        post.writer ??
        post.writerName ??
        post.authorNickname ??
        "작성자";

    createdAt.textContent = formatDate(post.createdAt);

    viewCount.textContent = formatCount(post.viewCount ?? 0);
    commentCount.textContent = formatCount(post.commentCount ?? 0);

    currentLikeCount = post.likeCount ?? 0;
    isLiked = post.liked ?? false;
    updateLikeUi();

    currentPostOwnerId = post.userId ?? post.authorId;

    if (isOwner(currentPostOwnerId)) {
        postActions.style.display = "flex";
    } else {
        postActions.style.display = "none";
    }
}

async function fetchPostDetail() {
    const postId = getSelectedPostId();

    if (!postId) {
        alert("선택된 게시글이 없습니다.");
        window.location.href = "./posts.html";
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/posts/${postId}`,
            {
                credentials: "include"
            }
        );

        if (!response.ok) {
            throw new Error("게시글 상세 조회 실패");
        }

        const post = await response.json();

        console.log("게시글 상세 조회 성공:", post);

        renderPostDetail(post);
        await fetchLikeStatus();
    } catch (error) {
        console.error(error);
        alert("게시글을 불러오지 못했습니다.");
        window.location.href = "./posts.html";
    }
}

backButton.addEventListener("click", function () {
    window.location.href = getBoardPage(currentBoardType);
});

postEditButton.addEventListener("click", function () {
    const postId = getSelectedPostId();

    if (!postId) {
        alert("선택된 게시글이 없습니다.");
        window.location.href = "./posts.html";
        return;
    }

    console.log("게시글 수정 클릭");
    window.location.href = `./post-edit.html?postId=${postId}`;
});

postDeleteButton.addEventListener("click", function () {
    console.log("게시글 삭제 클릭");
    openModal(postDeleteModal);
});

postDeleteCancel.addEventListener("click", function () {
    closeModal(postDeleteModal);
});

postDeleteConfirm.addEventListener("click", async function () {
    const postId = getSelectedPostId();

    if (!postId) {
        alert("선택된 게시글이 없습니다.");
        window.location.href = "./posts.html";
        return;
    }

    if (!isOwner(currentPostOwnerId)) {
        alert("작성자만 삭제할 수 있습니다.");
        closeModal(postDeleteModal);
        return;
    }

    try {
        await apiFetch(`/posts/${postId}`, {
            method: "DELETE"
        });

        console.log("게시글 삭제 성공:", postId);

        localStorage.removeItem("selectedPostId");

        closeModal(postDeleteModal);
        alert("게시글이 삭제되었습니다.");
        window.location.href = getBoardPage(currentBoardType);
    } catch (error) {
        console.error("게시글 삭제 요청 오류:", error);
        alert(error?.message ?? "게시글 삭제에 실패했습니다.");
    }
});

likeButton.addEventListener("click", toggleLike);

commentInput.addEventListener("input", updateCommentSubmitButton);

commentEditCancelButton.addEventListener("click", function () {
    resetCommentEditMode();

    console.log("댓글 수정 취소");
});

commentSubmitButton.addEventListener("click", async function () {
    const content = commentInput.value.trim();

    if (content.length === 0) {
        return;
    }

    const postId = getSelectedPostId();
    const userId = localStorage.getItem("userId");

    if (!postId) {
        alert("선택된 게시글이 없습니다.");
        window.location.href = "./posts.html";
        return;
    }

    if (!userId) {
        alert("로그인이 필요합니다.");
        window.location.href = "./login.html";
        return;
    }

    if (editingCommentId) {
        try {
            const updatedComment = await apiFetch(`/posts/${postId}/comments/${editingCommentId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    content: content
                })
            });

            console.log("댓글 수정 성공:", updatedComment);

            resetCommentEditMode();

            await fetchComments();
            await fetchPostDetail();
            return;
        } catch (error) {
            console.error("댓글 수정 요청 오류:", error);
            alert(error?.message ?? "댓글 수정에 실패했습니다.");
            return;
        }
    }

    try {
        const newComment = await apiFetch(`/posts/${postId}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: Number(userId),
                content: content
            })
        });

        console.log("댓글 등록 성공:", newComment);

        commentInput.value = "";
        updateCommentSubmitButton();

        await fetchComments();
        await fetchPostDetail();
    } catch (error) {
        console.error("댓글 등록 요청 오류:", error);
        alert(error?.message ?? "댓글 등록에 실패했습니다.");
    }
});

commentDeleteCancel.addEventListener("click", function () {
    deletingCommentId = null;
    closeModal(commentDeleteModal);
});

commentDeleteConfirm.addEventListener("click", async function () {
    const postId = getSelectedPostId();

    if (!postId || !deletingCommentId) {
        return;
    }

    try {
        await apiFetch(`/posts/${postId}/comments/${deletingCommentId}`, {
            method: "DELETE"
        });

        console.log("댓글 삭제 성공:", deletingCommentId);

        deletingCommentId = null;
        closeModal(commentDeleteModal);

        await fetchComments();
        await fetchPostDetail();
    } catch (error) {
        console.error("댓글 삭제 요청 오류:", error);
        alert(error?.message ?? "댓글 삭제에 실패했습니다.");
    }
});

fetchPostDetail();
fetchComments();
updateCommentSubmitButton();
updateLikeUi();
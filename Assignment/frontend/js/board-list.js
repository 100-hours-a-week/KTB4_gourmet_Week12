const postList = document.querySelector("#post-list");

const CURRENT_BOARD = document.body.dataset.board || "free";

const BOARD_TYPE_VALUES = {
    free: "FREE",
    question: "QUESTION",
    study: "STUDY",
    project: "PROJECT"
};

const API_BOARD_TYPE =
    BOARD_TYPE_VALUES[CURRENT_BOARD] || BOARD_TYPE_VALUES.free;

let currentPage = 0;
const pageSize = 10;
let isLoading = false;
let hasMore = true;
const renderedPostIds = new Set();

const BOARD_EMPTY_MESSAGES = {
    free: "아직 자유 게시판에 글이 없습니다.",
    question: "아직 등록된 질문이 없습니다. 첫 질문을 남겨보세요.",
    study: "아직 학습 기록이 없습니다. 오늘의 배움을 남겨보세요.",
    project: "아직 모집 중인 프로젝트가 없습니다."
};

const BOARD_BADGES = {
    FREE: "FREE",
    QUESTION: "Q&A",
    STUDY: "STUDY LOG",
    PROJECT: "RECRUIT"
};

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

function getPostId(post) {
    return extractPostId(post);
}

function getPostTitle(post) {
    return post.title ?? "제목 없음";
}

function getWriterName(post) {
    return post.nickname ?? post.writer ?? post.writerName ?? post.authorNickname ?? "작성자";
}

function getThumbnailUrl(post) {
    if (!post.imageUrls || post.imageUrls.length === 0) {
        return null;
    }

    return `${API_BASE_URL}${post.imageUrls[0]}`;
}

function getWriterProfileImageUrl(post) {
    const profileImage = post.profileImage ?? post.writerProfileImage ?? post.authorProfileImage;

    if (!profileImage) {
        return null;
    }

    return `${API_BASE_URL}${profileImage}`;
}

function createStatElement(label, count) {
    const stat = document.createElement("span");
    stat.textContent = `${label} ${formatCount(count)}`;
    return stat;
}

function clearEmptyMessage() {
    const emptyMessage = postList.querySelector(".empty-message");

    if (emptyMessage) {
        emptyMessage.remove();
    }
}

function createPostCard(post) {
    const article = document.createElement("article");
    article.className = "post-card";

    const postId = getPostId(post);
    const thumbnailUrl = getThumbnailUrl(post);
    const writerProfileImageUrl = getWriterProfileImageUrl(post);

    article.dataset.postId = postId;

    const postContent = document.createElement("div");
    postContent.className = "post-content";

    const postCardTop = document.createElement("div");
    postCardTop.className = "post-card-top";

    const postCardText = document.createElement("div");
    postCardText.className = "post-card-text";

    const badge = document.createElement("span");
    badge.className = "post-badge";
    badge.textContent =
        BOARD_BADGES[post.boardType] || "POST";

    const postTitle = document.createElement("h2");
    postTitle.className = "post-title";
    postTitle.textContent = getPostTitle(post);

    const postStats = document.createElement("div");
    postStats.className = "post-stats";

    postStats.appendChild(createStatElement("좋아요", post.likeCount));
    postStats.appendChild(createStatElement("댓글", post.commentCount));
    postStats.appendChild(createStatElement("조회수", post.viewCount));

    postCardText.appendChild(badge);
    postCardText.appendChild(postTitle);
    postCardText.appendChild(postStats);

    if (CURRENT_BOARD === "project") {
        const parsed = parseProjectContent(post.content);
        const meta = getProjectMeta(postId);
        const periodStart = meta?.periodStart || parsed.periodStart;
        const periodEnd = meta?.periodEnd || parsed.periodEnd;

        if (periodStart && periodEnd) {
            const period = document.createElement("p");
            period.className = "post-period";
            period.textContent = `모집 기간 ${periodStart} ~ ${periodEnd}`;
            postCardText.appendChild(period);
        }
    }

    postCardTop.appendChild(postCardText);

    if (thumbnailUrl) {
        const thumbnailWrapper = document.createElement("div");
        thumbnailWrapper.className = "post-thumbnail-wrapper";

        const thumbnailImage = document.createElement("img");
        thumbnailImage.className = "post-thumbnail";
        thumbnailImage.src = thumbnailUrl;
        thumbnailImage.alt = "게시글 썸네일";

        thumbnailWrapper.appendChild(thumbnailImage);
        postCardTop.appendChild(thumbnailWrapper);
    }

    postContent.appendChild(postCardTop);

    const postWriter = document.createElement("div");
    postWriter.className = "post-writer";

    const writerImage = document.createElement("div");
    writerImage.className = "writer-image";

    if (writerProfileImageUrl) {
        writerImage.style.backgroundImage = `url(${writerProfileImageUrl})`;
        writerImage.style.backgroundSize = "cover";
        writerImage.style.backgroundPosition = "center";
    }

    const writerName = document.createElement("span");
    writerName.className = "writer-name";
    writerName.textContent = getWriterName(post);

    const postDate = document.createElement("span");
    postDate.className = "post-date";
    postDate.textContent = formatDate(post.createdAt);

    postWriter.appendChild(writerImage);
    postWriter.appendChild(writerName);
    postWriter.appendChild(postDate);

    article.appendChild(postContent);
    article.appendChild(postWriter);

    article.addEventListener("click", function () {
        localStorage.setItem("selectedPostId", postId);
        window.location.href = `./post-detail.html?postId=${postId}`;
    });

    return article;
}

function appendPosts(posts) {
    if (!posts.length) {
        return 0;
    }

    clearEmptyMessage();

    let appended = 0;

    posts.forEach(function (post) {
        const postId = String(getPostId(post) ?? "");

        if (!postId || renderedPostIds.has(postId)) {
            return;
        }

        renderedPostIds.add(postId);
        postList.appendChild(createPostCard(post));
        appended += 1;
    });

    return appended;
}

function renderEmptyMessage(message) {
    postList.replaceChildren();
    renderedPostIds.clear();

    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-message";
    emptyMessage.textContent = message || BOARD_EMPTY_MESSAGES[CURRENT_BOARD] || "게시글이 없습니다.";

    postList.appendChild(emptyMessage);
}

function getPageContent(pageData) {
    if (Array.isArray(pageData)) {
        return pageData;
    }

    return pageData.content ?? pageData.posts ?? pageData.data ?? [];
}

function getHasNext(pageData, fetchedCount) {
    if (typeof pageData.hasNext === "boolean") {
        return pageData.hasNext;
    }

    if (typeof pageData.last === "boolean") {
        return !pageData.last;
    }

    return fetchedCount >= pageSize;
}

async function fetchPosts() {
    if (isLoading || !hasMore) {
        return;
    }

    isLoading = true;

    try {
        const query = new URLSearchParams({
            boardType: API_BOARD_TYPE,
            page: String(currentPage),
            size: String(pageSize)
        });

        const response = await fetch(
            `${API_BASE_URL}/posts?${query.toString()}`
        );

        if (!response.ok) {
            throw new Error("게시글 목록 조회 실패");
        }

        const pageData = await response.json();
        const posts = getPageContent(pageData);

        console.log(
            `${API_BOARD_TYPE} 게시판 목록 조회 성공:`,
            pageData
        );

        if (currentPage === 0 && posts.length === 0) {
            renderEmptyMessage();
            hasMore = false;
            return;
        }

        appendPosts(posts);

        hasMore = getHasNext(pageData, posts.length);
        currentPage = (pageData.page ?? currentPage) + 1;

        if (!hasMore) {
            const cardCount =
                postList.querySelectorAll(".post-card").length;

            if (cardCount === 0) {
                renderEmptyMessage();
            }
        }
    } catch (error) {
        console.error(error);

        if (
            currentPage === 0 &&
            postList.querySelectorAll(".post-card").length === 0
        ) {
            renderEmptyMessage(
                "게시글 목록을 불러오지 못했습니다."
            );
        }
    } finally {
        isLoading = false;
    }
}

function handleInfiniteScroll() {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= documentHeight - 100) {
        fetchPosts();
    }
}

window.addEventListener("scroll", handleInfiniteScroll);

fetchPosts();

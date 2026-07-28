const writeButton = document.querySelector("#write-button");
const postList = document.querySelector("#post-list");

let currentPage = 0;
const pageSize = 10;
let isLoading = false;
let hasMore = true;

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
    return post.postId ?? post.id;
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

    const postTitle = document.createElement("h2");
    postTitle.className = "post-title";
    postTitle.textContent = getPostTitle(post);

    const postStats = document.createElement("div");
    postStats.className = "post-stats";

    postStats.appendChild(createStatElement("좋아요", post.likeCount));
    postStats.appendChild(createStatElement("댓글", post.commentCount));
    postStats.appendChild(createStatElement("조회수", post.viewCount));

    postCardText.appendChild(postTitle);
    postCardText.appendChild(postStats);

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
        window.location.href = `./post-detail.html?postId=${postId}`;
    });

    return article;
}

function renderEmptyMessage(message = "아직 작성된 게시글이 없습니다.") {
    postList.replaceChildren();

    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-message";
    emptyMessage.textContent = message;

    postList.appendChild(emptyMessage);
}

async function fetchPosts() {
    if (isLoading || !hasMore) {
        return;
    }

    isLoading = true;

    try {
        const response = await fetch(`${API_BASE_URL}/posts?page=${currentPage}&size=${pageSize}`);

        if (!response.ok) {
            throw new Error("게시글 목록 조회 실패");
        }

        const pageData = await response.json();
        const posts = pageData.content ?? [];

        console.log("게시글 목록 조회 성공:", pageData);

        if (currentPage === 0 && posts.length === 0) {
            renderEmptyMessage();
            hasMore = false;
            return;
        }

        posts.forEach(function (post) {
            const postCard = createPostCard(post);
            postList.appendChild(postCard);
        });

        hasMore = pageData.hasNext;
        currentPage = pageData.page + 1;
    } catch (error) {
        console.error(error);

        if (currentPage === 0) {
            renderEmptyMessage("게시글 목록을 불러오지 못했습니다.");
        }
    } finally {
        isLoading = false;
    }
}

function handleInfiniteScroll() {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    const isBottom = scrollTop + windowHeight >= documentHeight - 100;

    if (isBottom) {
        fetchPosts();
    }
}

writeButton.addEventListener("click", function () {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("로그인이 필요합니다.");
        window.location.href = "./login.html";
        return;
    }

    window.location.href = "./post-create.html";
});

window.addEventListener("scroll", handleInfiniteScroll);

fetchPosts();

/* ---------- UI only: sidebar / board tabs / search (API 로직과 분리) ---------- */

const layout = document.querySelector("#layout");
const navToggle = document.querySelector("#nav-toggle");
const boardLinks = document.querySelectorAll(".board-link");
const listHeading = document.querySelector("#list-heading");

const boardTitles = {
    all: "전체 글",
    free: "자유",
    question: "질문",
    study: "학습 기록",
    project: "프로젝트 모집"
};

if (navToggle && layout) {
    navToggle.addEventListener("click", function () {
        const collapsed = layout.classList.toggle("sidebar-collapsed");
        navToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
        navToggle.setAttribute(
            "aria-label",
            collapsed ? "게시판 메뉴 열기" : "게시판 메뉴 닫기"
        );
    });
}

boardLinks.forEach(function (link) {
    link.addEventListener("click", function () {
        boardLinks.forEach(function (item) {
            item.classList.remove("is-active");
        });

        link.classList.add("is-active");

        const board = link.dataset.board || "all";

        if (listHeading) {
            listHeading.textContent = boardTitles[board] || "전체 글";
        }
    });
});


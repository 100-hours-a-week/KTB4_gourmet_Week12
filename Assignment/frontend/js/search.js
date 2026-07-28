const searchBackButton =
    document.querySelector("#search-back-button");

const headerSearchForm =
    document.querySelector("#header-search");

const searchInput =
    document.querySelector("#search-input");

const searchFilterForm =
    document.querySelector("#search-filter-form");

const searchTypeSelect =
    document.querySelector("#search-type");

const boardTypeSelect =
    document.querySelector("#board-type");

const sortTypeSelect =
    document.querySelector("#sort-type");

const searchResultTitle =
    document.querySelector("#search-result-title");

const searchResultCount =
    document.querySelector("#search-result-count");

const searchResultList =
    document.querySelector("#search-result-list");

const previousPageButton =
    document.querySelector("#previous-page-button");

const nextPageButton =
    document.querySelector("#next-page-button");

const pageInformation =
    document.querySelector("#page-information");

const SEARCH_TYPES = [
    "ALL",
    "TITLE",
    "CONTENT",
    "NICKNAME"
];

const BOARD_TYPES = [
    "",
    "FREE",
    "QUESTION",
    "STUDY",
    "PROJECT"
];

const SORT_TYPES = [
    "LATEST",
    "VIEW_COUNT"
];

const BOARD_BADGES = {
    FREE: "FREE",
    QUESTION: "Q&A",
    STUDY: "STUDY LOG",
    PROJECT: "RECRUIT"
};

const urlParams =
    new URLSearchParams(window.location.search);

const keyword =
    (urlParams.get("keyword") || "").trim();

const searchType =
    getAllowedValue(
        urlParams.get("searchType"),
        SEARCH_TYPES,
        "ALL"
    );

const boardType =
    getAllowedValue(
        urlParams.get("boardType"),
        BOARD_TYPES,
        ""
    );

const sortType =
    getAllowedValue(
        urlParams.get("sortType"),
        SORT_TYPES,
        "LATEST"
    );

const currentPage =
    getNonNegativeNumber(
        urlParams.get("page"),
        0
    );

const pageSize =
    getPositiveNumber(
        urlParams.get("size"),
        10
    );

function getAllowedValue(
    value,
    allowedValues,
    defaultValue
) {
    if (!value) {
        return defaultValue;
    }

    const normalized =
        String(value).toUpperCase();

    return allowedValues.includes(normalized)
        ? normalized
        : defaultValue;
}

function getNonNegativeNumber(value, defaultValue) {
    const number = Number(value);

    if (!Number.isInteger(number) || number < 0) {
        return defaultValue;
    }

    return number;
}

function getPositiveNumber(value, defaultValue) {
    const number = Number(value);

    if (
        !Number.isInteger(number) ||
        number < 1 ||
        number > 100
    ) {
        return defaultValue;
    }

    return number;
}

function formatCount(count) {
    const value = Number(count ?? 0);

    if (value >= 1000) {
        return `${Math.floor(value / 1000)}k`;
    }

    return value;
}

function formatDate(dateValue) {
    if (!dateValue) {
        return "";
    }

    return String(dateValue)
        .replace("T", " ")
        .slice(0, 19);
}

function getPostId(post) {
    return post.id ?? post.postId ?? null;
}

function getDisplayContent(post) {
    const content = post.content ?? "";

    if (
        post.boardType === "PROJECT" &&
        typeof parseProjectContent === "function"
    ) {
        return parseProjectContent(content).content;
    }

    return content;
}

function getThumbnailUrl(post) {
    if (
        !Array.isArray(post.imageUrls) ||
        post.imageUrls.length === 0
    ) {
        return null;
    }

    return `${API_BASE_URL}${post.imageUrls[0]}`;
}

function createSearchResultCard(post) {
    const article =
        document.createElement("article");

    article.className = "search-result-card";
    article.tabIndex = 0;

    const postId = getPostId(post);

    const main =
        document.createElement("div");

    main.className = "search-card-main";

    const badge =
        document.createElement("span");

    badge.className = "search-card-badge";
    badge.textContent =
        BOARD_BADGES[post.boardType] || "POST";

    const title =
        document.createElement("h3");

    title.className = "search-card-title";
    title.textContent =
        post.title ?? "제목 없음";

    const content =
        document.createElement("p");

    content.className = "search-card-content";
    content.textContent =
        getDisplayContent(post);

    const meta =
        document.createElement("div");

    meta.className = "search-card-meta";

    const writer =
        document.createElement("span");

    writer.textContent =
        `작성자 ${post.nickname ?? "알 수 없음"}`;

    const createdAt =
        document.createElement("span");

    createdAt.textContent =
        formatDate(post.createdAt);

    meta.appendChild(writer);
    meta.appendChild(createdAt);

    const stats =
        document.createElement("div");

    stats.className = "search-card-stats";

    const likeCount =
        document.createElement("span");

    likeCount.textContent =
        `좋아요 ${formatCount(post.likeCount)}`;

    const commentCount =
        document.createElement("span");

    commentCount.textContent =
        `댓글 ${formatCount(post.commentCount)}`;

    const viewCount =
        document.createElement("span");

    viewCount.textContent =
        `조회수 ${formatCount(post.viewCount)}`;

    stats.appendChild(likeCount);
    stats.appendChild(commentCount);
    stats.appendChild(viewCount);

    main.appendChild(badge);
    main.appendChild(title);
    main.appendChild(content);
    main.appendChild(meta);
    main.appendChild(stats);

    article.appendChild(main);

    const thumbnailUrl =
        getThumbnailUrl(post);

    if (thumbnailUrl) {
        const thumbnail =
            document.createElement("img");

        thumbnail.className =
            "search-card-thumbnail";

        thumbnail.src = thumbnailUrl;
        thumbnail.alt = "게시글 썸네일";

        article.appendChild(thumbnail);
    }

    function moveToPostDetail() {
        if (postId == null) {
            return;
        }

        localStorage.setItem(
            "selectedPostId",
            String(postId)
        );

        window.location.href =
            `./post-detail.html?postId=${postId}`;
    }

    article.addEventListener(
        "click",
        moveToPostDetail
    );

    article.addEventListener(
        "keydown",
        function (event) {
            if (
                event.key === "Enter" ||
                event.key === " "
            ) {
                event.preventDefault();
                moveToPostDetail();
            }
        }
    );

    return article;
}

function renderMessage(className, message) {
    searchResultList.replaceChildren();

    const paragraph =
        document.createElement("p");

    paragraph.className = className;
    paragraph.textContent = message;

    searchResultList.appendChild(paragraph);
}

function renderSearchResults(posts) {
    searchResultList.replaceChildren();

    if (!posts.length) {
        renderMessage(
            "search-empty-message",
            "검색 결과가 없습니다."
        );
        return;
    }

    posts.forEach(function (post) {
        searchResultList.appendChild(
            createSearchResultCard(post)
        );
    });
}

function createSearchPageUrl(page) {
    const query = new URLSearchParams({
        keyword: searchInput.value.trim(),
        searchType: searchTypeSelect.value,
        sortType: sortTypeSelect.value,
        page: String(page),
        size: String(pageSize)
    });

    if (boardTypeSelect.value) {
        query.set(
            "boardType",
            boardTypeSelect.value
        );
    }

    return `./search.html?${query.toString()}`;
}

function moveToPage(page) {
    window.location.href =
        createSearchPageUrl(page);
}

async function fetchSearchResults() {
    if (!keyword) {
        searchResultTitle.textContent =
            "검색 결과";

        searchResultCount.textContent =
            "검색어를 입력해주세요.";

        previousPageButton.disabled = true;
        nextPageButton.disabled = true;

        renderMessage(
            "search-empty-message",
            "상단 검색창에 검색어를 입력해주세요."
        );

        return;
    }

    renderMessage(
        "search-loading-message",
        "검색 결과를 불러오는 중입니다."
    );

    try {
        const query = new URLSearchParams({
            keyword: keyword,
            searchType: searchType,
            sortType: sortType,
            page: String(currentPage),
            size: String(pageSize)
        });

        if (boardType) {
            query.set(
                "boardType",
                boardType
            );
        }

        const pageData = await apiFetch(
            `/posts/search?${query.toString()}`
        );

        if (!pageData) {
            return;
        }

        const posts =
            pageData.content ?? [];

        searchResultTitle.textContent =
            `"${keyword}" 검색 결과`;

        searchResultCount.textContent =
            `총 ${pageData.totalElements ?? 0}건`;

        renderSearchResults(posts);

        const totalPages =
            pageData.totalPages ?? 0;

        pageInformation.textContent =
            totalPages === 0
                ? "0 / 0"
                : `${pageData.page + 1} / ${totalPages}`;

        previousPageButton.disabled =
            !pageData.hasPrevious;

        nextPageButton.disabled =
            !pageData.hasNext;

        console.log(
            "통합 검색 성공:",
            pageData
        );
    } catch (error) {
        console.error(
            "통합 검색 오류:",
            error
        );

        searchResultCount.textContent = "";

        previousPageButton.disabled = true;
        nextPageButton.disabled = true;

        renderMessage(
            "search-error-message",
            error?.message ??
                "검색 결과를 불러오지 못했습니다."
        );
    }
}

searchInput.value = keyword;
searchTypeSelect.value = searchType;
boardTypeSelect.value = boardType;
sortTypeSelect.value = sortType;

headerSearchForm.addEventListener(
    "submit",
    function (event) {
        event.preventDefault();

        const newKeyword =
            searchInput.value.trim();

        if (!newKeyword) {
            alert("검색어를 입력해주세요.");
            searchInput.focus();
            return;
        }

        moveToPage(0);
    }
);

searchFilterForm.addEventListener(
    "submit",
    function (event) {
        event.preventDefault();

        if (!searchInput.value.trim()) {
            alert("검색어를 입력해주세요.");
            searchInput.focus();
            return;
        }

        moveToPage(0);
    }
);

previousPageButton.addEventListener(
    "click",
    function () {
        if (currentPage > 0) {
            moveToPage(currentPage - 1);
        }
    }
);

nextPageButton.addEventListener(
    "click",
    function () {
        moveToPage(currentPage + 1);
    }
);

searchBackButton.addEventListener(
    "click",
    function () {
        window.location.href =
            "./posts.html";
    }
);

fetchSearchResults();
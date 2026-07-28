const PROJECT_META_KEY = "gourmetProjectMeta";

const BOARD_PAGES = {
    free: "./posts.html",
    question: "./question.html",
    study: "./study.html",
    project: "./project.html"
};

const BOARD_CREATE_PAGES = {
    free: "./post-create.html?board=free",
    question: "./post-create.html?board=question",
    study: "./post-create.html?board=study",
    project: "./project-create.html"
};

function extractPostId(post) {
    if (post == null) {
        return null;
    }

    if (typeof post === "number" || typeof post === "string") {
        return post;
    }

    return (
        post.postId ??
        post.id ??
        post.data?.postId ??
        post.data?.id ??
        null
    );
}

function getBoardPage(boardType) {
    return BOARD_PAGES[boardType] || BOARD_PAGES.free;
}

function getCreatePage(boardType) {
    return BOARD_CREATE_PAGES[boardType] || BOARD_CREATE_PAGES.free;
}

function getProjectMetaMap() {
    try {
        const raw = localStorage.getItem(PROJECT_META_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (error) {
        console.error("프로젝트 메타 파싱 오류:", error);
        return {};
    }
}

function setProjectMeta(postId, meta) {
    if (postId == null) {
        return;
    }

    const map = getProjectMetaMap();
    map[String(postId)] = meta;

    localStorage.setItem(
        PROJECT_META_KEY,
        JSON.stringify(map)
    );
}

function getProjectMeta(postId) {
    if (postId == null) {
        return null;
    }

    const map = getProjectMetaMap();

    return map[String(postId)] || null;
}

function buildProjectContent(periodStart, periodEnd, content) {
    return `[모집기간] ${periodStart} ~ ${periodEnd}\n\n${content}`;
}

function parseProjectContent(rawContent) {
    const text = String(rawContent ?? "");

    const matched = text.match(
        /^\[모집기간\]\s*(.+?)\s*~\s*(.+?)(?:\n\n([\s\S]*))?$/
    );

    if (!matched) {
        return {
            periodStart: null,
            periodEnd: null,
            content: text
        };
    }

    return {
        periodStart: matched[1].trim(),
        periodEnd: matched[2].trim(),
        content: (matched[3] ?? "").trim()
    };
}
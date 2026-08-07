export const BOARD_CONFIG = Object.freeze({
    free: {
        routeType: "free",
        apiType: "FREE",
        eyebrow: "Free Board",
        title: "자유 게시판",
        description:
            "일상, 잡담, 개발 이야기까지 자유롭게 나눠보세요.",
        listTitle: "자유 게시판",
        writeLabel: "글 작성",
        writePath: "/posts/new?board=free",
        emptyMessage:
            "아직 자유 게시판에 글이 없습니다.",
        icon: "chat"
    },

    question: {
        routeType: "question",
        apiType: "QUESTION",
        eyebrow: "Q & A",
        title: "질문 게시판",
        description:
            "개발 중 막힌 지점과 해결 과정을 함께 나눠보세요.",
        listTitle: "질문 게시판",
        writeLabel: "질문 작성",
        writePath: "/posts/new?board=question",
        emptyMessage:
            "아직 등록된 질문이 없습니다. 첫 질문을 남겨보세요.",
        icon: "question"
    },

    study: {
        routeType: "study",
        apiType: "STUDY",
        eyebrow: "Study Journal",
        title: "학습 기록",
        description:
            "오늘의 배움과 다음 학습 계획을 기록해보세요.",
        listTitle: "학습 기록",
        writeLabel: "기록 작성",
        writePath: "/posts/new?board=study",
        emptyMessage:
            "아직 학습 기록이 없습니다. 오늘의 배움을 남겨보세요.",
        icon: "book"
    },

    project: {
        routeType: "project",
        apiType: "PROJECT",
        eyebrow: "Project Recruit",
        title: "프로젝트 모집",
        description:
            "함께할 팀원을 찾고, 모집 기간을 명확히 남겨보세요.",
        listTitle: "모집 공고",
        writeLabel: "모집 글쓰기",
        writePath: "/projects/new",
        emptyMessage:
            "아직 모집 중인 프로젝트가 없습니다.",
        icon: "users"
    }
});

export const BOARD_LINKS = Object.values(
    BOARD_CONFIG
).map(function (board) {
    return {
        routeType: board.routeType,
        title: board.title,
        path: `/boards/${board.routeType}`,
        icon: board.icon
    };
});

export function getBoardConfig(boardType) {
    return BOARD_CONFIG[boardType] ?? null;
}

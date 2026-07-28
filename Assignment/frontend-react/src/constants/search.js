export const SEARCH_TYPE_OPTIONS =
    Object.freeze([
        {
            value: "ALL",
            label: "전체"
        },
        {
            value: "TITLE",
            label: "제목"
        },
        {
            value: "CONTENT",
            label: "내용"
        },
        {
            value: "NICKNAME",
            label: "작성자"
        }
    ]);

export const SEARCH_SORT_OPTIONS =
    Object.freeze([
        {
            value: "LATEST",
            label: "최신순"
        },
        {
            value: "VIEW_COUNT",
            label: "조회순"
        },
        {
            value: "LIKE_COUNT",
            label: "좋아요순"
        }
    ]);

const SEARCH_TYPES =
    new Set(
        SEARCH_TYPE_OPTIONS.map(
            function (option) {
                return option.value;
            }
        )
    );

const SEARCH_SORT_TYPES =
    new Set(
        SEARCH_SORT_OPTIONS.map(
            function (option) {
                return option.value;
            }
        )
    );

const BOARD_TYPES =
    new Set([
        "FREE",
        "QUESTION",
        "STUDY",
        "PROJECT"
    ]);

export function normalizeSearchType(value) {
    return SEARCH_TYPES.has(value)
        ? value
        : "ALL";
}

export function normalizeSearchSortType(value) {
    return SEARCH_SORT_TYPES.has(value)
        ? value
        : "LATEST";
}

export function normalizeSearchBoardType(value) {
    return BOARD_TYPES.has(value)
        ? value
        : "";
}

export function normalizeSearchPage(value) {
    const page =
        Number(value);

    return (
        Number.isInteger(page) &&
        page >= 0
    )
        ? page
        : 0;
}
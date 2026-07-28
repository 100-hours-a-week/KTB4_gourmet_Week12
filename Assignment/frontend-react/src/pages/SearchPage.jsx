import {
    useEffect,
    useState
} from "react";

import {
    useSearchParams
} from "react-router";

import {
    searchPosts
} from "../api/searchApi.js";

import PostCard from
    "../components/post/PostCard.jsx";

import {
    BOARD_CONFIG
} from "../constants/boards.js";

import {
    normalizeSearchBoardType,
    normalizeSearchPage,
    normalizeSearchSortType,
    normalizeSearchType,
    SEARCH_SORT_OPTIONS,
    SEARCH_TYPE_OPTIONS
} from "../constants/search.js";

import "../styles/search.css";

const PAGE_SIZE = 10;
const MAX_KEYWORD_LENGTH = 100;

const BOARD_OPTIONS =
    Object.values(
        BOARD_CONFIG
    ).map(
        function (board) {
            return {
                value: board.apiType,
                label: board.title
            };
        }
    );

function createPageNumbers(
    currentPage,
    totalPages
) {
    const visiblePageCount = 5;

    if (
        !Number.isInteger(totalPages) ||
        totalPages <= 0
    ) {
        return [];
    }

    const maxStart =
        Math.max(
            0,
            totalPages -
                visiblePageCount
        );

    const start =
        Math.min(
            Math.max(
                currentPage - 2,
                0
            ),
            maxStart
        );

    const end =
        Math.min(
            start +
                visiblePageCount,
            totalPages
        );

    return Array.from(
        {
            length: end - start
        },
        function (_, index) {
            return start + index;
        }
    );
}

function SearchPage() {
    const [
        searchParams,
        setSearchParams
    ] = useSearchParams();

    const appliedKeyword =
        (
            searchParams.get(
                "keyword"
            ) ?? ""
        ).trim();

    const appliedSearchType =
        normalizeSearchType(
            searchParams.get(
                "searchType"
            )
        );

    const appliedBoardType =
        normalizeSearchBoardType(
            searchParams.get(
                "boardType"
            )
        );

    const appliedSortType =
        normalizeSearchSortType(
            searchParams.get(
                "sortType"
            )
        );

    const appliedPage =
        normalizeSearchPage(
            searchParams.get("page")
        );

    const [
        form,
        setForm
    ] = useState({
        keyword:
            appliedKeyword,

        searchType:
            appliedSearchType,

        boardType:
            appliedBoardType,

        sortType:
            appliedSortType
    });

    const [
        pageData,
        setPageData
    ] = useState(null);

    const [
        isLoading,
        setIsLoading
    ] = useState(false);

    const [
        error,
        setError
    ] = useState("");

    const [
        formError,
        setFormError
    ] = useState("");

    useEffect(function () {
        document.title =
            "통합 검색 · Gourmet Community";
    }, []);

    useEffect(function () {
        setForm({
            keyword:
                appliedKeyword,

            searchType:
                appliedSearchType,

            boardType:
                appliedBoardType,

            sortType:
                appliedSortType
        });
    }, [
        appliedKeyword,
        appliedSearchType,
        appliedBoardType,
        appliedSortType
    ]);

    useEffect(function () {
        if (!appliedKeyword) {
            setPageData(null);
            setError("");
            setIsLoading(false);
            return undefined;
        }

        const controller =
            new AbortController();

        let ignore = false;

        async function loadSearchResults() {
            setIsLoading(true);
            setError("");
            setPageData(null);

            try {
                const data =
                    await searchPosts({
                        keyword:
                            appliedKeyword,

                        searchType:
                            appliedSearchType,

                        boardType:
                            appliedBoardType,

                        sortType:
                            appliedSortType,

                        page:
                            appliedPage,

                        size:
                            PAGE_SIZE,

                        signal:
                            controller.signal
                    });

                if (!ignore) {
                    setPageData(data);
                }
            } catch (requestError) {
                if (
                    requestError.name ===
                    "AbortError"
                ) {
                    return;
                }

                console.error(
                    "통합 검색 오류:",
                    requestError
                );

                if (!ignore) {
                    setError(
                        requestError
                            ?.message ??
                        "검색 결과를 불러오지 못했습니다."
                    );
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadSearchResults();

        return function () {
            ignore = true;
            controller.abort();
        };
    }, [
        appliedKeyword,
        appliedSearchType,
        appliedBoardType,
        appliedSortType,
        appliedPage
    ]);

    function handleFormChange(event) {
        const {
            name,
            value
        } = event.target;

        setForm(
            function (
                currentForm
            ) {
                return {
                    ...currentForm,
                    [name]: value
                };
            }
        );

        setFormError("");
    }

    function handleSubmit(event) {
        event.preventDefault();

        const keyword =
            form.keyword.trim();

        if (!keyword) {
            setFormError(
                "검색어를 입력해주세요."
            );

            return;
        }

        const nextParams =
            new URLSearchParams();

        nextParams.set(
            "keyword",
            keyword
        );

        nextParams.set(
            "searchType",
            form.searchType
        );

        if (form.boardType) {
            nextParams.set(
                "boardType",
                form.boardType
            );
        }

        nextParams.set(
            "sortType",
            form.sortType
        );

        nextParams.set(
            "page",
            "0"
        );

        nextParams.set(
            "size",
            String(PAGE_SIZE)
        );

        setSearchParams(
            nextParams
        );
    }

    function changePage(nextPage) {
        if (
            isLoading ||
            nextPage < 0
        ) {
            return;
        }

        const nextParams =
            new URLSearchParams(
                searchParams
            );

        nextParams.set(
            "page",
            String(nextPage)
        );

        nextParams.set(
            "size",
            String(PAGE_SIZE)
        );

        setSearchParams(
            nextParams
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    const posts =
        Array.isArray(
            pageData?.content
        )
            ? pageData.content
            : [];

    const totalElements =
        Number(
            pageData?.totalElements ??
            0
        );

    const totalPages =
        Number(
            pageData?.totalPages ??
            0
        );

    const currentPage =
        Number(
            pageData?.page ??
            appliedPage
        );

    const pageNumbers =
        createPageNumbers(
            currentPage,
            totalPages
        );

    return (
        <div className="search-page">
            <section className="search-intro">
                <p className="search-eyebrow">
                    Integrated Search
                </p>

                <h1>통합 검색</h1>

                <p>
                    자유 게시판, 질문, 학습 기록,
                    프로젝트 모집 게시글을 한 번에
                    검색합니다.
                </p>
            </section>

            <form
                className="search-filter-form"
                role="search"
                noValidate
                onSubmit={handleSubmit}
            >
                <div className="search-keyword-field">
                    <label htmlFor="search-page-keyword">
                        검색어
                    </label>

                    <div className="search-keyword-row">
                        <input
                            type="search"
                            id="search-page-keyword"
                            name="keyword"
                            value={form.keyword}
                            maxLength={
                                MAX_KEYWORD_LENGTH
                            }
                            placeholder="검색어를 입력해주세요."
                            autoComplete="off"
                            onChange={
                                handleFormChange
                            }
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                        >
                            {
                                isLoading
                                    ? "검색 중"
                                    : "검색"
                            }
                        </button>
                    </div>

                    <p
                        className="search-form-error"
                        aria-live="polite"
                    >
                        {formError}
                    </p>
                </div>

                <div className="search-option-grid">
                    <div className="search-option-field">
                        <label htmlFor="search-type">
                            검색 범위
                        </label>

                        <select
                            id="search-type"
                            name="searchType"
                            value={
                                form.searchType
                            }
                            onChange={
                                handleFormChange
                            }
                        >
                            {
                                SEARCH_TYPE_OPTIONS.map(
                                    function (
                                        option
                                    ) {
                                        return (
                                            <option
                                                key={
                                                    option.value
                                                }
                                                value={
                                                    option.value
                                                }
                                            >
                                                {
                                                    option.label
                                                }
                                            </option>
                                        );
                                    }
                                )
                            }
                        </select>
                    </div>

                    <div className="search-option-field">
                        <label htmlFor="search-board-type">
                            게시판
                        </label>

                        <select
                            id="search-board-type"
                            name="boardType"
                            value={
                                form.boardType
                            }
                            onChange={
                                handleFormChange
                            }
                        >
                            <option value="">
                                전체 게시판
                            </option>

                            {
                                BOARD_OPTIONS.map(
                                    function (
                                        option
                                    ) {
                                        return (
                                            <option
                                                key={
                                                    option.value
                                                }
                                                value={
                                                    option.value
                                                }
                                            >
                                                {
                                                    option.label
                                                }
                                            </option>
                                        );
                                    }
                                )
                            }
                        </select>
                    </div>

                    <div className="search-option-field">
                        <label htmlFor="search-sort-type">
                            정렬
                        </label>

                        <select
                            id="search-sort-type"
                            name="sortType"
                            value={
                                form.sortType
                            }
                            onChange={
                                handleFormChange
                            }
                        >
                            {
                                SEARCH_SORT_OPTIONS.map(
                                    function (
                                        option
                                    ) {
                                        return (
                                            <option
                                                key={
                                                    option.value
                                                }
                                                value={
                                                    option.value
                                                }
                                            >
                                                {
                                                    option.label
                                                }
                                            </option>
                                        );
                                    }
                                )
                            }
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="search-apply-button"
                        disabled={isLoading}
                    >
                        조건 적용
                    </button>
                </div>
            </form>

            <section
                className="search-result-section"
                aria-live="polite"
            >
                {
                    !appliedKeyword && (
                        <p className="search-state-message">
                            검색어를 입력하면 게시글을
                            찾아드립니다.
                        </p>
                    )
                }

                {
                    appliedKeyword &&
                    isLoading && (
                        <p className="search-state-message">
                            검색 결과를 불러오는 중입니다.
                        </p>
                    )
                }

                {
                    appliedKeyword &&
                    !isLoading &&
                    error && (
                        <p className="search-error-message">
                            {error}
                        </p>
                    )
                }

                {
                    appliedKeyword &&
                    !isLoading &&
                    !error &&
                    pageData && (
                        <>
                            <header className="search-result-header">
                                <h2>
                                    “{appliedKeyword}”
                                    검색 결과
                                </h2>

                                <span>
                                    총{" "}
                                    {
                                        totalElements
                                    }
                                    건
                                </span>
                            </header>

                            {
                                posts.length === 0
                                    ? (
                                        <p className="search-state-message">
                                            조건에 맞는 게시글이
                                            없습니다.
                                        </p>
                                    )
                                    : (
                                        <div className="search-result-list">
                                            {
                                                posts.map(
                                                    function (
                                                        post
                                                    ) {
                                                        return (
                                                            <PostCard
                                                                key={
                                                                    post.id ??
                                                                    post.postId
                                                                }
                                                                post={
                                                                    post
                                                                }
                                                                showExcerpt
                                                            />
                                                        );
                                                    }
                                                )
                                            }
                                        </div>
                                    )
                            }

                            {
                                totalPages > 1 && (
                                    <nav
                                        className="search-pagination"
                                        aria-label="검색 결과 페이지"
                                    >
                                        <button
                                            type="button"
                                            className="search-page-direction"
                                            disabled={
                                                currentPage <=
                                                    0 ||
                                                isLoading
                                            }
                                            onClick={
                                                function () {
                                                    changePage(
                                                        currentPage -
                                                            1
                                                    );
                                                }
                                            }
                                        >
                                            이전
                                        </button>

                                        {
                                            pageNumbers.map(
                                                function (
                                                    pageNumber
                                                ) {
                                                    const isCurrent =
                                                        pageNumber ===
                                                        currentPage;

                                                    return (
                                                        <button
                                                            key={
                                                                pageNumber
                                                            }
                                                            type="button"
                                                            className={
                                                                `search-page-number ${
                                                                    isCurrent
                                                                        ? "active"
                                                                        : ""
                                                                }`
                                                            }
                                                            aria-current={
                                                                isCurrent
                                                                    ? "page"
                                                                    : undefined
                                                            }
                                                            disabled={
                                                                isLoading
                                                            }
                                                            onClick={
                                                                function () {
                                                                    changePage(
                                                                        pageNumber
                                                                    );
                                                                }
                                                            }
                                                        >
                                                            {
                                                                pageNumber +
                                                                1
                                                            }
                                                        </button>
                                                    );
                                                }
                                            )
                                        }

                                        <button
                                            type="button"
                                            className="search-page-direction"
                                            disabled={
                                                currentPage >=
                                                    totalPages -
                                                        1 ||
                                                isLoading
                                            }
                                            onClick={
                                                function () {
                                                    changePage(
                                                        currentPage +
                                                            1
                                                    );
                                                }
                                            }
                                        >
                                            다음
                                        </button>
                                    </nav>
                                )
                            }
                        </>
                    )
                }
            </section>
        </div>
    );
}

export default SearchPage;
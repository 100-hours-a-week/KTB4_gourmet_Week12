import {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";

import {
    getBoardPosts
} from "../api/postApi.js";

const PAGE_SIZE = 10;

function mergePosts(currentPosts, nextPosts) {
    const postMap =
        new Map();

    currentPosts.forEach(function (post) {
        const id =
            post.id ?? post.postId;

        postMap.set(String(id), post);
    });

    nextPosts.forEach(function (post) {
        const id =
            post.id ?? post.postId;

        postMap.set(String(id), post);
    });

    return Array.from(
        postMap.values()
    );
}

function useBoardPosts(apiBoardType) {
    const requestVersion =
        useRef(0);

    const [
        posts,
        setPosts
    ] = useState([]);

    const [
        nextPage,
        setNextPage
    ] = useState(0);

    const [
        hasNext,
        setHasNext
    ] = useState(true);

    const [
        isLoading,
        setIsLoading
    ] = useState(false);

    const [
        error,
        setError
    ] = useState("");

    useEffect(function () {
        const currentVersion =
            requestVersion.current + 1;

        requestVersion.current =
            currentVersion;

        const controller =
            new AbortController();

        async function loadFirstPage() {
            setPosts([]);
            setNextPage(0);
            setHasNext(true);
            setError("");
            setIsLoading(true);

            try {
                const pageData =
                    await getBoardPosts({
                        boardType:
                            apiBoardType,

                        page: 0,
                        size: PAGE_SIZE,
                        signal:
                            controller.signal
                    });

                if (
                    requestVersion.current !==
                    currentVersion
                ) {
                    return;
                }

                setPosts(
                    pageData.content ?? []
                );

                setNextPage(
                    (pageData.page ?? 0) + 1
                );

                setHasNext(
                    Boolean(
                        pageData.hasNext
                    )
                );
            } catch (requestError) {
                if (
                    requestError.name ===
                    "AbortError"
                ) {
                    return;
                }

                console.error(
                    "게시글 목록 조회 오류:",
                    requestError
                );

                if (
                    requestVersion.current ===
                    currentVersion
                ) {
                    setError(
                        requestError?.message ??
                        "게시글 목록을 불러오지 못했습니다."
                    );
                }
            } finally {
                if (
                    requestVersion.current ===
                    currentVersion
                ) {
                    setIsLoading(false);
                }
            }
        }

        loadFirstPage();

        return function () {
            controller.abort();
        };
    }, [apiBoardType]);

    const loadMore =
        useCallback(
            async function () {
                if (
                    isLoading ||
                    !hasNext
                ) {
                    return;
                }

                const currentVersion =
                    requestVersion.current;

                setIsLoading(true);
                setError("");

                try {
                    const pageData =
                        await getBoardPosts({
                            boardType:
                                apiBoardType,

                            page: nextPage,
                            size: PAGE_SIZE
                        });

                    if (
                        requestVersion.current !==
                        currentVersion
                    ) {
                        return;
                    }

                    const nextPosts =
                        pageData.content ?? [];

                    setPosts(
                        function (currentPosts) {
                            return mergePosts(
                                currentPosts,
                                nextPosts
                            );
                        }
                    );

                    setNextPage(
                        (pageData.page ??
                            nextPage) + 1
                    );

                    setHasNext(
                        Boolean(
                            pageData.hasNext
                        )
                    );
                } catch (requestError) {
                    console.error(
                        "추가 게시글 조회 오류:",
                        requestError
                    );

                    if (
                        requestVersion.current ===
                        currentVersion
                    ) {
                        setError(
                            requestError?.message ??
                            "추가 게시글을 불러오지 못했습니다."
                        );
                    }
                } finally {
                    if (
                        requestVersion.current ===
                        currentVersion
                    ) {
                        setIsLoading(false);
                    }
                }
            },
            [
                apiBoardType,
                hasNext,
                isLoading,
                nextPage
            ]
        );

    return {
        posts,
        hasNext,
        isLoading,
        error,
        loadMore
    };
}

export default useBoardPosts;
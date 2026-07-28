async function readResponseBody(response) {
    return response
        .json()
        .catch(function () {
            return null;
        });
}

function createSearchRequestError(
    response,
    data,
    fallbackMessage
) {
    const error =
        new Error(
            data?.message ??
            fallbackMessage
        );

    error.status =
        response.status;

    error.data =
        data;

    return error;
}

export async function searchPosts({
    keyword,
    searchType,
    boardType,
    sortType,
    page,
    size,
    signal
}) {
    const query =
        new URLSearchParams({
            keyword,
            searchType,
            sortType,
            page: String(page),
            size: String(size)
        });

    if (boardType) {
        query.set(
            "boardType",
            boardType
        );
    }

    const response =
        await fetch(
            `/api/posts/search?${query.toString()}`,
            {
                method: "GET",
                credentials: "include",
                signal
            }
        );

    const data =
        await readResponseBody(
            response
        );

    if (!response.ok) {
        throw createSearchRequestError(
            response,
            data,
            response.status === 400
                ? "검색 조건을 확인해주세요."
                : "검색 결과를 불러오지 못했습니다."
        );
    }

    return data;
}
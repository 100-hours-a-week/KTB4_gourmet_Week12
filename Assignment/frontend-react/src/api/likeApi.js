async function readResponseBody(response) {
    return response
        .json()
        .catch(function () {
            return null;
        });
}

function createLikeRequestError(
    response,
    data,
    fallbackMessage
) {
    const error = new Error(
        data?.message ?? fallbackMessage
    );

    error.status = response.status;
    error.data = data;

    return error;
}

async function requestLikeApi(
    postId,
    {
        method,
        signal,
        fallbackMessage
    }
) {
    const response = await fetch(
        `/api/posts/${postId}/likes`,
        {
            method,
            credentials: "include",
            signal
        }
    );

    const data =
        await readResponseBody(response);

    if (!response.ok) {
        throw createLikeRequestError(
            response,
            data,
            fallbackMessage
        );
    }

    return data;
}

export function getLikeStatus(
    postId,
    signal
) {
    return requestLikeApi(
        postId,
        {
            method: "GET",
            signal,
            fallbackMessage:
                "좋아요 상태를 불러오지 못했습니다."
        }
    );
}

export function addPostLike(postId) {
    return requestLikeApi(
        postId,
        {
            method: "POST",
            fallbackMessage:
                "좋아요 등록에 실패했습니다."
        }
    );
}

export function removePostLike(postId) {
    return requestLikeApi(
        postId,
        {
            method: "DELETE",
            fallbackMessage:
                "좋아요 취소에 실패했습니다."
        }
    );
}
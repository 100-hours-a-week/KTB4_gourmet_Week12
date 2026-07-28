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

export async function getLikeStatus(
    postId,
    userId,
    signal
) {
    const response = await fetch(
        `/api/posts/${postId}/likes/users/${userId}`,
        {
            method: "GET",
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
            "좋아요 상태를 불러오지 못했습니다."
        );
    }

    return data;
}

export async function togglePostLike(
    postId,
    userId
) {
    const response = await fetch(
        `/api/posts/${postId}/likes/users/${userId}`,
        {
            method: "POST",
            credentials: "include"
        }
    );

    const data =
        await readResponseBody(response);

    if (!response.ok) {
        throw createLikeRequestError(
            response,
            data,
            "좋아요 처리에 실패했습니다."
        );
    }

    return data;
}
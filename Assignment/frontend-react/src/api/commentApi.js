async function readResponseBody(response) {
    return response
        .json()
        .catch(function () {
            return null;
        });
}

function createCommentRequestError(
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

export async function getComments(
    postId,
    signal
) {
    const response = await fetch(
        `/api/posts/${postId}/comments`,
        {
            method: "GET",
            credentials: "include",
            signal
        }
    );

    const data =
        await readResponseBody(response);

    if (!response.ok) {
        throw createCommentRequestError(
            response,
            data,
            "댓글을 불러오지 못했습니다."
        );
    }

    return Array.isArray(data)
        ? data
        : [];
}

export async function createComment(
    postId,
    {
        userId,
        content
    }
) {
    const response = await fetch(
        `/api/posts/${postId}/comments`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            credentials: "include",

            body: JSON.stringify({
                userId,
                content
            })
        }
    );

    const data =
        await readResponseBody(response);

    if (!response.ok) {
        throw createCommentRequestError(
            response,
            data,
            "댓글 등록에 실패했습니다."
        );
    }

    return data;
}

export async function updateComment(
    postId,
    commentId,
    content
) {
    const response = await fetch(
        `/api/posts/${postId}/comments/${commentId}`,
        {
            method: "PATCH",

            headers: {
                "Content-Type": "application/json"
            },

            credentials: "include",

            body: JSON.stringify({
                content
            })
        }
    );

    const data =
        await readResponseBody(response);

    if (!response.ok) {
        throw createCommentRequestError(
            response,
            data,
            "댓글 수정에 실패했습니다."
        );
    }

    return data;
}

export async function deleteComment(
    postId,
    commentId
) {
    const response = await fetch(
        `/api/posts/${postId}/comments/${commentId}`,
        {
            method: "DELETE",
            credentials: "include"
        }
    );

    if (response.status === 204) {
        return;
    }

    const data =
        await readResponseBody(response);

    throw createCommentRequestError(
        response,
        data,
        "댓글 삭제에 실패했습니다."
    );
}
async function readResponseBody(response) {
    return response
        .json()
        .catch(function () {
            return null;
        });
}

function createPostRequestError(
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

export async function getBoardPosts({
    boardType,
    page,
    size,
    signal
}) {
    const query = new URLSearchParams({
        boardType,
        page: String(page),
        size: String(size)
    });

    const response = await fetch(
        `/api/posts?${query.toString()}`,
        {
            method: "GET",
            credentials: "include",
            signal
        }
    );

    const data =
        await readResponseBody(response);

    if (!response.ok) {
        throw createPostRequestError(
            response,
            data,
            "게시글 목록을 불러오지 못했습니다."
        );
    }

    return data;
}

export async function createPost({
    userId,
    title,
    content,
    boardType,
    images = []
}) {
    const numericUserId =
        Number(userId);

    if (
        !Number.isInteger(numericUserId) ||
        numericUserId < 1
    ) {
        throw new Error(
            "로그인 사용자 정보가 올바르지 않습니다."
        );
    }

    const formData =
        new FormData();

    formData.append(
        "title",
        title
    );

    formData.append(
        "content",
        content
    );

    formData.append(
        "boardType",
        boardType
    );

    images.forEach(function (image) {
        formData.append(
            "images",
            image
        );
    });

    const response = await fetch(
        `/api/users/${numericUserId}/posts`,
        {
            method: "POST",
            credentials: "include",
            body: formData
        }
    );

    const data =
        await readResponseBody(response);

    if (!response.ok) {
        throw createPostRequestError(
            response,
            data,
            "게시글 작성에 실패했습니다."
        );
    }

    return data;
}

export async function getPostDetail(
    postId,
    signal
) {
    const response = await fetch(
        `/api/posts/${postId}`,
        {
            method: "GET",
            credentials: "include",
            signal
        }
    );

    const data =
        await readResponseBody(response);

    if (!response.ok) {
        throw createPostRequestError(
            response,
            data,
            response.status === 404
                ? "게시글을 찾을 수 없습니다."
                : "게시글을 불러오지 못했습니다."
        );
    }

    return data;
}

export async function deletePost(postId) {
    const response = await fetch(
        `/api/posts/${postId}`,
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

    throw createPostRequestError(
        response,
        data,
        "게시글 삭제에 실패했습니다."
    );
}

export async function updatePost({
    postId,
    title,
    content,
    images = []
}) {
    const numericPostId =
        Number(postId);

    if (
        !Number.isInteger(numericPostId) ||
        numericPostId < 1
    ) {
        throw new Error(
            "게시글 번호가 올바르지 않습니다."
        );
    }

    const formData =
        new FormData();

    formData.append(
        "title",
        title
    );

    formData.append(
        "content",
        content
    );

    images.forEach(function (image) {
        formData.append(
            "images",
            image
        );
    });

    const response = await fetch(
        `/api/posts/${numericPostId}`,
        {
            method: "PATCH",
            credentials: "include",
            body: formData
        }
    );

    const data =
        await readResponseBody(response);

    if (!response.ok) {
        throw createPostRequestError(
            response,
            data,
            "게시글 수정에 실패했습니다."
        );
    }

    return data;
}

export async function getPopularPosts({
    limit = 5,
    signal
} = {}) {
    const query =
        new URLSearchParams({
            limit: String(limit)
        });

    const response = await fetch(
        `/api/posts/popular?${query.toString()}`,
        {
            method: "GET",
            credentials: "include",
            signal
        }
    );

    const data =
        await readResponseBody(response);

    if (!response.ok) {
        throw createPostRequestError(
            response,
            data,
            "인기 게시글을 불러오지 못했습니다."
        );
    }

    return data;
}
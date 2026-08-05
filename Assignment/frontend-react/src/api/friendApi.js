async function readResponseBody(response) {
    if (response.status === 204) {
        return null;
    }

    return response
        .json()
        .catch(function () {
            return null;
        });
}

function createFriendRequestError(
    response,
    data,
    fallbackMessage
) {
    const error = new Error(
        data?.message
        ?? data?.error
        ?? fallbackMessage
    );

    error.status = response.status;
    error.data = data;

    return error;
}

async function requestFriendApi(
    url,
    {
        method = "GET",
        signal,
        fallbackMessage =
            "친구 요청을 처리하지 못했습니다."
    } = {}
) {
    const response = await fetch(
        url,
        {
            method,
            credentials: "include",
            signal
        }
    );

    const data =
        await readResponseBody(response);

    if (!response.ok) {
        throw createFriendRequestError(
            response,
            data,
            fallbackMessage
        );
    }

    return data;
}

export function searchUsers(
    nickname,
    {
        page = 0,
        size = 20,
        signal
    } = {}
) {
    const params =
        new URLSearchParams({
            nickname,
            page: String(page),
            size: String(size)
        });

    return requestFriendApi(
        `/api/friends/search?${params.toString()}`,
        {
            signal,
            fallbackMessage:
                "사용자를 검색하지 못했습니다."
        }
    );
}

export function sendFriendRequest(
    receiverId
) {
    return requestFriendApi(
        `/api/friend-requests/${receiverId}`,
        {
            method: "POST",
            fallbackMessage:
                "친구 요청을 보내지 못했습니다."
        }
    );
}

export function acceptFriendRequest(
    requestId
) {
    return requestFriendApi(
        `/api/friend-requests/${requestId}/accept`,
        {
            method: "PATCH",
            fallbackMessage:
                "친구 요청을 수락하지 못했습니다."
        }
    );
}

export function rejectFriendRequest(
    requestId
) {
    return requestFriendApi(
        `/api/friend-requests/${requestId}/reject`,
        {
            method: "PATCH",
            fallbackMessage:
                "친구 요청을 거절하지 못했습니다."
        }
    );
}

export function cancelFriendRequest(
    requestId
) {
    return requestFriendApi(
        `/api/friend-requests/${requestId}/cancel`,
        {
            method: "PATCH",
            fallbackMessage:
                "친구 요청을 취소하지 못했습니다."
        }
    );
}

export function getReceivedFriendRequests({
    page = 0,
    size = 20,
    signal
} = {}) {
    const params =
        new URLSearchParams({
            page: String(page),
            size: String(size)
        });

    return requestFriendApi(
        `/api/friend-requests/received?${params.toString()}`,
        {
            signal,
            fallbackMessage:
                "받은 친구 요청을 불러오지 못했습니다."
        }
    );
}

export function getSentFriendRequests({
    page = 0,
    size = 20,
    signal
} = {}) {
    const params =
        new URLSearchParams({
            page: String(page),
            size: String(size)
        });

    return requestFriendApi(
        `/api/friend-requests/sent?${params.toString()}`,
        {
            signal,
            fallbackMessage:
                "보낸 친구 요청을 불러오지 못했습니다."
        }
    );
}

export function getFriends({
    page = 0,
    size = 50,
    signal
} = {}) {
    const params =
        new URLSearchParams({
            page: String(page),
            size: String(size)
        });

    return requestFriendApi(
        `/api/friends?${params.toString()}`,
        {
            signal,
            fallbackMessage:
                "친구 목록을 불러오지 못했습니다."
        }
    );
}
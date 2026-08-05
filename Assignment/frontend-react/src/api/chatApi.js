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

function createChatRequestError(
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

async function requestChatApi(
    url,
    {
        method = "GET",
        signal,
        body,
        fallbackMessage =
            "채팅 요청을 처리하지 못했습니다."
    } = {}
) {
    const requestOptions = {
        method,
        credentials: "include",
        signal
    };

    if (body !== undefined) {
        requestOptions.headers = {
            "Content-Type": "application/json"
        };

        requestOptions.body =
            JSON.stringify(body);
    }

    const response =
        await fetch(
            url,
            requestOptions
        );

    const data =
        await readResponseBody(
            response
        );

    if (!response.ok) {
        throw createChatRequestError(
            response,
            data,
            fallbackMessage
        );
    }

    return data;
}

/*
 * 친구와의 기존 채팅방을 반환하거나,
 * 채팅방이 없으면 새로 생성한다.
 */
export function getOrCreateFriendChatRoom(
    friendUserId,
    {
        signal
    } = {}
) {
    return requestChatApi(
        `/api/chat/rooms/friends/${friendUserId}`,
        {
            method: "POST",
            signal,
            fallbackMessage:
                "채팅방을 생성하지 못했습니다."
        }
    );
}

/*
 * 로그인 사용자가 참여하고 있는
 * 1:1 채팅방 목록을 조회한다.
 */
export function getChatRooms({
    page = 0,
    size = 20,
    signal
} = {}) {
    const params =
        new URLSearchParams({
            page: String(page),
            size: String(size)
        });

    return requestChatApi(
        `/api/chat/rooms?${params.toString()}`,
        {
            signal,
            fallbackMessage:
                "채팅방 목록을 불러오지 못했습니다."
        }
    );
}

/*
 * 채팅방의 최근 메시지를 조회한다.
 *
 * beforeSequence가 없으면 최신 메시지,
 * 값이 있으면 해당 sequence보다
 * 이전 메시지를 조회한다.
 */
export function getChatMessages(
    roomId,
    {
        beforeSequence = null,
        size = 50,
        signal
    } = {}
) {
    const params =
        new URLSearchParams({
            size: String(size)
        });

    if (
        beforeSequence !== null
        && beforeSequence !== undefined
    ) {
        params.set(
            "beforeSequence",
            String(beforeSequence)
        );
    }

    return requestChatApi(
        `/api/chat/rooms/${roomId}/messages?${params.toString()}`,
        {
            signal,
            fallbackMessage:
                "채팅 메시지를 불러오지 못했습니다."
        }
    );
}

/*
 * 현재 채팅 상대들의
 * 온라인·오프라인 상태를 조회한다.
 */
export function getChatPresence({
    signal
} = {}) {
    return requestChatApi(
        "/api/chat/presence",
        {
            signal,
            fallbackMessage:
                "접속 상태를 불러오지 못했습니다."
        }
    );
}

export function getChatReadState(
    roomId,
    {
        signal
    } = {}
) {
    return requestChatApi(
        `/api/chat/rooms/${roomId}/read-state`,
        {
            signal,
            fallbackMessage:
                "채팅 읽음 상태를 불러오지 못했습니다."
        }
    );
}

export function getChatUnreadCount({
    signal
} = {}) {
    return requestChatApi(
        "/api/chat/unread-count",
        {
            signal,
            fallbackMessage:
                "읽지 않은 채팅 개수를 불러오지 못했습니다."
        }
    );
}
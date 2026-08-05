const FRIEND_DATA_CHANGED_EVENT =
    "gourmet:friend-data-changed";

/*
 * SSE를 직접 여러 컴포넌트에서 연결하지 않고,
 * NotificationBell이 받은 친구 변경 사실을
 * 프론트 내부에 전달한다.
 */
export function publishFriendDataChanged(
    detail = {}
) {
    window.dispatchEvent(
        new CustomEvent(
            FRIEND_DATA_CHANGED_EVENT,
            {
                detail
            }
        )
    );
}

/*
 * 구독 해제 함수를 반환해 컴포넌트가
 * 사라질 때 이벤트 리스너를 정리할 수 있다.
 */
export function subscribeFriendDataChanged(
    listener
) {
    function handleEvent(event) {
        listener(event.detail);
    }

    window.addEventListener(
        FRIEND_DATA_CHANGED_EVENT,
        handleEvent
    );

    return function unsubscribe() {
        window.removeEventListener(
            FRIEND_DATA_CHANGED_EVENT,
            handleEvent
        );
    };
}
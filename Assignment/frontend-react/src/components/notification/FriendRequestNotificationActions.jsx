import {
    useState
} from "react";

import {
    acceptFriendRequest,
    rejectFriendRequest
} from "../../api/friendApi.js";

function FriendRequestNotificationActions({
    friendRequestId,
    notificationId,
    onProcessed
}) {
    const [
        processingAction,
        setProcessingAction
    ] = useState(null);

    const [
        errorMessage,
        setErrorMessage
    ] = useState("");

    const isProcessing =
        processingAction !== null;

    async function processRequest(action) {
        if (
            isProcessing
            || !friendRequestId
        ) {
            return;
        }

        setProcessingAction(action);
        setErrorMessage("");

        try {
            if (action === "accept") {
                await acceptFriendRequest(
                    friendRequestId
                );
            } else {
                await rejectFriendRequest(
                    friendRequestId
                );
            }

            await onProcessed?.(
                notificationId,
                action
            );
        } catch (error) {
            /*
             * 409는 다른 탭에서 이미 수락·거절했거나
             * 요청자가 취소했을 가능성이 있다.
             *
             * 서버 상태를 임의로 성공 처리하지 않고
             * 오류를 사용자에게 표시한다.
             */
            setErrorMessage(
                error?.message
                ?? "친구 요청을 처리하지 못했습니다."
            );
        } finally {
            setProcessingAction(null);
        }
    }

    return (
        <div
            className={
                "notification-friend-request"
            }
        >
            <div
                className={
                    "notification-friend-actions"
                }
            >
                <button
                    type="button"
                    className={
                        "notification-friend-button is-accept"
                    }
                    disabled={isProcessing}
                    onClick={function () {
                        processRequest("accept");
                    }}
                >
                    {
                        processingAction === "accept"
                            ? "수락 중"
                            : "수락"
                    }
                </button>

                <button
                    type="button"
                    className={
                        "notification-friend-button is-reject"
                    }
                    disabled={isProcessing}
                    onClick={function () {
                        processRequest("reject");
                    }}
                >
                    {
                        processingAction === "reject"
                            ? "거절 중"
                            : "거절"
                    }
                </button>
            </div>

            {
                errorMessage && (
                    <p
                        className={
                            "notification-friend-error"
                        }
                        role="alert"
                    >
                        {errorMessage}
                    </p>
                )
            }
        </div>
    );
}

export default FriendRequestNotificationActions;
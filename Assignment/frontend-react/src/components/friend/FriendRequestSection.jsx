import FriendAvatar
    from "./FriendAvatar.jsx";

function FriendRequestSection({
    receivedRequests,
    sentRequests,
    processingKey,
    onAccept,
    onReject,
    onCancel
}) {
    return (
        <section
            className="friends-card"
            aria-labelledby="friend-request-title"
        >
            <header className="friends-card-header">
                <div>
                    <p className="friends-eyebrow">
                        REQUESTS
                    </p>

                    <h2 id="friend-request-title">
                        친구 요청
                    </h2>
                </div>
            </header>

            <div className="friend-request-columns">
                <div>
                    <h3>
                        받은 요청
                        <span>
                            {receivedRequests.length}
                        </span>
                    </h3>

                    {
                        receivedRequests.length === 0
                            ? (
                                <p className="friends-state is-small">
                                    받은 요청이 없습니다.
                                </p>
                            )
                            : (
                                <ul className="friend-request-list">
                                    {
                                        receivedRequests.map(
                                            function (request) {
                                                const key =
                                                    `request:${request.requestId}`;

                                                const processing =
                                                    processingKey
                                                    === key;

                                                return (
                                                    <li
                                                        key={
                                                            request.requestId
                                                        }
                                                    >
                                                        <FriendAvatar
                                                            nickname={
                                                                request.sender.nickname
                                                            }
                                                            profileImage={
                                                                request.sender.profileImage
                                                            }
                                                            size="small"
                                                        />

                                                        <strong>
                                                            {
                                                                request.sender.nickname
                                                            }
                                                        </strong>

                                                        <div
                                                            className={
                                                                "friend-inline-actions"
                                                            }
                                                        >
                                                            <button
                                                                type="button"
                                                                className={
                                                                    "friend-action-button is-primary is-small"
                                                                }
                                                                disabled={
                                                                    processing
                                                                }
                                                                onClick={
                                                                    function () {
                                                                        onAccept(
                                                                            request.requestId,
                                                                            key
                                                                        );
                                                                    }
                                                                }
                                                            >
                                                                수락
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className={
                                                                    "friend-action-button is-secondary is-small"
                                                                }
                                                                disabled={
                                                                    processing
                                                                }
                                                                onClick={
                                                                    function () {
                                                                        onReject(
                                                                            request.requestId,
                                                                            key
                                                                        );
                                                                    }
                                                                }
                                                            >
                                                                거절
                                                            </button>
                                                        </div>
                                                    </li>
                                                );
                                            }
                                        )
                                    }
                                </ul>
                            )
                    }
                </div>

                <div>
                    <h3>
                        보낸 요청
                        <span>
                            {sentRequests.length}
                        </span>
                    </h3>

                    {
                        sentRequests.length === 0
                            ? (
                                <p className="friends-state is-small">
                                    보낸 요청이 없습니다.
                                </p>
                            )
                            : (
                                <ul className="friend-request-list">
                                    {
                                        sentRequests.map(
                                            function (request) {
                                                const key =
                                                    `request:${request.requestId}`;

                                                const processing =
                                                    processingKey
                                                    === key;

                                                return (
                                                    <li
                                                        key={
                                                            request.requestId
                                                        }
                                                    >
                                                        <FriendAvatar
                                                            nickname={
                                                                request.receiver.nickname
                                                            }
                                                            profileImage={
                                                                request.receiver.profileImage
                                                            }
                                                            size="small"
                                                        />

                                                        <strong>
                                                            {
                                                                request.receiver.nickname
                                                            }
                                                        </strong>

                                                        <button
                                                            type="button"
                                                            className={
                                                                "friend-action-button is-secondary is-small"
                                                            }
                                                            disabled={
                                                                processing
                                                            }
                                                            onClick={
                                                                function () {
                                                                    onCancel(
                                                                        request.requestId,
                                                                        key
                                                                    );
                                                                }
                                                            }
                                                        >
                                                            {
                                                                processing
                                                                    ? "처리 중"
                                                                    : "취소"
                                                            }
                                                        </button>
                                                    </li>
                                                );
                                            }
                                        )
                                    }
                                </ul>
                            )
                    }
                </div>
            </div>
        </section>
    );
}

export default FriendRequestSection;
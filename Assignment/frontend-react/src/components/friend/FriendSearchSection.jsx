import FriendAvatar
    from "./FriendAvatar.jsx";

function FriendSearchSection({
    keyword,
    results,
    hasSearched,
    isSearching,
    searchError,
    processingKey,
    onKeywordChange,
    onSearch,
    onSend,
    onCancel,
    onAccept,
    onReject
}) {
    function renderActions(user) {
        const itemKey =
            `user:${user.userId}`;

        const isProcessing =
            processingKey === itemKey;

        switch (user.relationStatus) {
            case "REQUEST_SENT":
                return (
                    <button
                        type="button"
                        className={
                            "friend-action-button is-secondary"
                        }
                        disabled={
                            isProcessing
                            || !user.friendRequestId
                        }
                        onClick={function () {
                            onCancel(
                                user.friendRequestId,
                                itemKey
                            );
                        }}
                    >
                        {
                            isProcessing
                                ? "처리 중"
                                : "요청 취소"
                        }
                    </button>
                );

            case "REQUEST_RECEIVED":
                return (
                    <div
                        className={
                            "friend-inline-actions"
                        }
                    >
                        <button
                            type="button"
                            className={
                                "friend-action-button is-primary"
                            }
                            disabled={
                                isProcessing
                                || !user.friendRequestId
                            }
                            onClick={function () {
                                onAccept(
                                    user.friendRequestId,
                                    itemKey
                                );
                            }}
                        >
                            수락
                        </button>

                        <button
                            type="button"
                            className={
                                "friend-action-button is-secondary"
                            }
                            disabled={
                                isProcessing
                                || !user.friendRequestId
                            }
                            onClick={function () {
                                onReject(
                                    user.friendRequestId,
                                    itemKey
                                );
                            }}
                        >
                            거절
                        </button>
                    </div>
                );

            case "FRIEND":
                return (
                    <span className="friend-status-badge">
                        친구
                    </span>
                );

            case "NONE":
            default:
                return (
                    <button
                        type="button"
                        className={
                            "friend-action-button is-primary"
                        }
                        disabled={isProcessing}
                        onClick={function () {
                            onSend(
                                user.userId,
                                itemKey
                            );
                        }}
                    >
                        {
                            isProcessing
                                ? "요청 중"
                                : "친구 요청"
                        }
                    </button>
                );
        }
    }

    return (
        <section
            className="friends-card"
            aria-labelledby="friend-search-title"
        >
            <header className="friends-card-header">
                <div>
                    <p className="friends-eyebrow">
                        FIND PEOPLE
                    </p>

                    <h2 id="friend-search-title">
                        친구 찾기
                    </h2>
                </div>
            </header>

            <form
                className="friend-search-form"
                onSubmit={onSearch}
            >
                <label
                    className="visually-hidden"
                    htmlFor="friend-search-input"
                >
                    닉네임 검색
                </label>

                <input
                    id="friend-search-input"
                    type="search"
                    value={keyword}
                    placeholder="닉네임을 2자 이상 입력하세요"
                    minLength={2}
                    maxLength={50}
                    autoComplete="off"
                    onChange={function (event) {
                        onKeywordChange(
                            event.target.value
                        );
                    }}
                />

                <button
                    type="submit"
                    disabled={isSearching}
                >
                    {
                        isSearching
                            ? "검색 중"
                            : "검색"
                    }
                </button>
            </form>

            {
                searchError && (
                    <p className="friends-error">
                        {searchError}
                    </p>
                )
            }

            {
                hasSearched
                && !isSearching
                && results.length === 0
                && !searchError
                && (
                    <p className="friends-state">
                        검색 결과가 없습니다.
                    </p>
                )
            }

            <ul className="friend-search-results">
                {
                    results.map(function (user) {
                        return (
                            <li
                                key={user.userId}
                                className={
                                    "friend-search-item"
                                }
                            >
                                <FriendAvatar
                                    nickname={
                                        user.nickname
                                    }
                                    profileImage={
                                        user.profileImage
                                    }
                                />

                                <div
                                    className={
                                        "friend-user-copy"
                                    }
                                >
                                    <strong>
                                        {user.nickname}
                                    </strong>

                                    <span>
                                        Gourmet 회원
                                    </span>
                                </div>

                                {renderActions(user)}
                            </li>
                        );
                    })
                }
            </ul>
        </section>
    );
}

export default FriendSearchSection;
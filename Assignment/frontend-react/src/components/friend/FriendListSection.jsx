import FriendAvatar
    from "./FriendAvatar.jsx";

function FriendListSection({
    friends,
    isLoading,
    chattingUserId,
    onStartChat
}) {
    return (
        <section
            className="friends-card"
            aria-labelledby="friend-list-title"
        >
            <header className="friends-card-header">
                <div>
                    <p className="friends-eyebrow">
                        MY CONNECTIONS
                    </p>

                    <h2 id="friend-list-title">
                        친구 목록
                    </h2>
                </div>

                <span className="friends-count">
                    {friends.length}명
                </span>
            </header>

            {
                isLoading && (
                    <p className="friends-state">
                        친구 목록을 불러오는 중입니다.
                    </p>
                )
            }

            {
                !isLoading
                && friends.length === 0
                && (
                    <p className="friends-state">
                        아직 등록된 친구가 없습니다.
                    </p>
                )
            }

            <ul className="friend-list">
                {
                    friends.map(function (friend) {
                        const friendUserId =
                            Number(
                                friend.userId
                            );

                        const hasValidUserId =
                            Number.isInteger(
                                friendUserId
                            )
                            && friendUserId > 0;

                        const isOpeningChat =
                            chattingUserId
                            === friendUserId;

                        return (
                            <li
                                key={
                                    friend.friendshipId
                                }
                                className={
                                    "friend-list-item"
                                }
                            >
                                <FriendAvatar
                                    nickname={
                                        friend.nickname
                                    }
                                    profileImage={
                                        friend.profileImage
                                    }
                                />

                                <div
                                    className={
                                        "friend-user-copy"
                                    }
                                >
                                    <strong>
                                        {friend.nickname}
                                    </strong>

                                    <span>
                                        친구
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className={
                                        "friend-chat-button"
                                    }
                                    disabled={
                                        !hasValidUserId
                                        || isOpeningChat
                                    }
                                    onClick={
                                        function () {
                                            onStartChat(
                                                friendUserId
                                            );
                                        }
                                    }
                                >
                                    {
                                        isOpeningChat
                                            ? "이동 중"
                                            : "채팅"
                                    }
                                </button>
                            </li>
                        );
                    })
                }
            </ul>
        </section>
    );
}

export default FriendListSection;
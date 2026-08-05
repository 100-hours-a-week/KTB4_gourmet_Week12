function formatMessageTime(
    createdAt
) {
    if (!createdAt) {
        return "";
    }

    const date =
        new Date(createdAt);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    return new Intl.DateTimeFormat(
        "ko-KR",
        {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }
    ).format(date);
}

function ChatMessageItem({
    message,
    currentUserId,
    showReadReceipt
}) {
    const isMine =
        Number(message.senderId)
        === Number(currentUserId);

    const classNames = [
        "chat-message-item",
        isMine
            ? "is-mine"
            : "is-other",
        message.pending
            ? "is-pending"
            : "",
        message.failed
            ? "is-failed"
            : ""
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <li className={classNames}>
            {
                !isMine && (
                    <p className="chat-message-sender">
                        {
                            message.senderNickname
                            ?? "알 수 없음"
                        }
                    </p>
                )
            }

            <div className="chat-message-row">
                {
                    isMine && (
                        <div className="chat-message-meta">
                            {
                                showReadReceipt
                                && !message.pending
                                && !message.failed
                                && (
                                    <span
                                        className={
                                            "chat-message-read"
                                        }
                                    >
                                        읽음
                                    </span>
                                )
                            }

                            {
                                message.pending && (
                                    <span>
                                        전송 중
                                    </span>
                                )
                            }

                            {
                                message.failed && (
                                    <span className="is-error">
                                        전송 실패
                                    </span>
                                )
                            }

                            <time>
                                {
                                    formatMessageTime(
                                        message.createdAt
                                    )
                                }
                            </time>
                        </div>
                    )
                }

                <div className="chat-message-bubble">
                    {message.content}
                </div>

                {
                    !isMine && (
                        <div className="chat-message-meta">
                            <time>
                                {
                                    formatMessageTime(
                                        message.createdAt
                                    )
                                }
                            </time>
                        </div>
                    )
                }
            </div>
        </li>
    );
}

export default ChatMessageItem;
import ChatMessageItem
    from "./ChatMessageItem.jsx";

function findReadReceiptSequence(
    messages,
    currentUserId,
    otherLastReadSequence
) {
    return messages.reduce(
        function (
            latestSequence,
            message
        ) {
            const sequence =
                Number(
                    message.sequence
                );

            const isMine =
                Number(message.senderId)
                === Number(currentUserId);

            if (
                !isMine
                || !Number.isInteger(
                    sequence
                )
                || sequence < 1
                || sequence
                    > otherLastReadSequence
            ) {
                return latestSequence;
            }

            return Math.max(
                latestSequence,
                sequence
            );
        },
        0
    );
}

function ChatMessageList({
    messages,
    currentUserId,
    otherLastReadSequence,
    isInitialLoading,
    isLoadingPrevious,
    hasMore,
    onLoadPrevious,
    containerRef
}) {
    const readReceiptSequence =
        findReadReceiptSequence(
            messages,
            currentUserId,
            otherLastReadSequence
        );

    return (
        <div
            className="chat-message-scroll"
            ref={containerRef}
        >
            {
                hasMore && (
                    <div className="chat-load-previous">
                        <button
                            type="button"
                            disabled={
                                isLoadingPrevious
                            }
                            onClick={
                                onLoadPrevious
                            }
                        >
                            {
                                isLoadingPrevious
                                    ? "불러오는 중"
                                    : "이전 메시지 보기"
                            }
                        </button>
                    </div>
                )
            }

            {
                isInitialLoading && (
                    <p className="chat-message-state">
                        메시지를 불러오는 중입니다.
                    </p>
                )
            }

            {
                !isInitialLoading
                && messages.length === 0
                && (
                    <div className="chat-message-empty">
                        <strong>
                            아직 메시지가 없습니다.
                        </strong>

                        <span>
                            첫 메시지를 보내
                            대화를 시작해보세요.
                        </span>
                    </div>
                )
            }

            <ol className="chat-message-list">
                {
                    messages.map(
                        function (message) {
                            const key =
                                message.messageId
                                    ? `message-${message.messageId}`
                                    : `client-${message.clientMessageId}`;

                            return (
                                <ChatMessageItem
                                    key={key}
                                    message={message}
                                    currentUserId={
                                        currentUserId
                                    }
                                    showReadReceipt={
                                        Number(
                                            message.sequence
                                        )
                                        === readReceiptSequence
                                    }
                                />
                            );
                        }
                    )
                }
            </ol>
        </div>
    );
}

export default ChatMessageList;
function ChatMessageComposer({
    value,
    isConnected,
    onChange,
    onSubmit
}) {
    function handleSubmit(
        event
    ) {
        event.preventDefault();

        onSubmit();
    }

    function handleKeyDown(
        event
    ) {
        if (
            event.key === "Enter"
            && !event.shiftKey
        ) {
            event.preventDefault();

            onSubmit();
        }
    }

    return (
        <form
            className="chat-composer"
            onSubmit={handleSubmit}
        >
            <label
                className="visually-hidden"
                htmlFor="chat-message-input"
            >
                채팅 메시지
            </label>

            <div className="chat-composer-field">
                <textarea
                    id="chat-message-input"
                    value={value}
                    rows={1}
                    maxLength={2000}
                    disabled={!isConnected}
                    placeholder={
                        isConnected
                            ? "메시지 입력..."
                            : "채팅 서버에 연결 중입니다."
                    }
                    onChange={
                        function (event) {
                            onChange(
                                event.target.value
                            );
                        }
                    }
                    onKeyDown={
                        handleKeyDown
                    }
                />
            </div>

            <button
                type="submit"
                className="chat-composer-send"
                aria-label="메시지 전송"
                disabled={
                    !isConnected
                    || !value.trim()
                }
            >
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    fill="currentColor"
                >
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
            </button>
        </form>
    );
}

export default ChatMessageComposer;

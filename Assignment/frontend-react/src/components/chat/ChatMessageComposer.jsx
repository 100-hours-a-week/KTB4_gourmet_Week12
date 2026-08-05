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

            <textarea
                id="chat-message-input"
                value={value}
                rows={1}
                maxLength={2000}
                disabled={!isConnected}
                placeholder={
                    isConnected
                        ? "메시지를 입력하세요."
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

            <div className="chat-composer-side">
                <span>
                    {value.length}/2000
                </span>

                <button
                    type="submit"
                    disabled={
                        !isConnected
                        || !value.trim()
                    }
                >
                    전송
                </button>
            </div>
        </form>
    );
}

export default ChatMessageComposer;
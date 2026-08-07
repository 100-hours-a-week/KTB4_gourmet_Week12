import {
    useRef
} from "react";

function ChatMessageComposer({
    value,
    isConnected,
    onChange,
    onSubmit
}) {
    /*
     * 한글/일본어/중국어 등 IME 조합 상태를
     * React 이벤트와 별도로 추적한다.
     *
     * 일부 브라우저에서는 Enter 시점의
     * nativeEvent.isComposing 값이
     * 일관되지 않을 수 있으므로 ref도 함께 사용한다.
     */
    const isComposingRef =
        useRef(false);

    function handleSubmit(
        event
    ) {
        event.preventDefault();

        onSubmit();
    }

    function handleCompositionStart() {
        isComposingRef.current =
            true;
    }

    function handleCompositionEnd() {
        isComposingRef.current =
            false;
    }

    function isImeComposing(
        event
    ) {
        const nativeEvent =
            event.nativeEvent;

        return (
            isComposingRef.current
            || nativeEvent?.isComposing
                === true

            /*
             * 일부 WebKit 계열 환경에서는
             * IME 처리 중 keyCode 229가 전달될 수 있다.
             *
             * keyCode는 deprecated이지만
             * IME 호환성 fallback 용도로만 사용한다.
             */
            || nativeEvent?.keyCode
                === 229
        );
    }

    function handleKeyDown(
        event
    ) {
        if (
            event.key !== "Enter"
            || event.shiftKey
        ) {
            return;
        }

        /*
         * IME로 문자를 조합하고 있는 동안
         * Enter는 메시지 전송이 아니라
         * 현재 문자를 확정하는 키로 취급한다.
         */
        if (
            isImeComposing(
                event
            )
        ) {
            return;
        }

        event.preventDefault();

        onSubmit();
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
                    onCompositionStart={
                        handleCompositionStart
                    }
                    onCompositionEnd={
                        handleCompositionEnd
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
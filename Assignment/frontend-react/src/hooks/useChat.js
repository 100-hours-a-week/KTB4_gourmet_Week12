import { useContext } from "react";

import ChatContext
    from "../contexts/ChatContext.js";

function useChat() {
    const context =
        useContext(ChatContext);

    if (!context) {
        throw new Error(
            "useChat은 ChatProvider 내부에서 사용해야 합니다."
        );
    }

    return context;
}

export default useChat;
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import App from "./App.jsx";

import AuthProvider
    from "./contexts/AuthProvider.jsx";

import ChatProvider
    from "./contexts/ChatProvider.jsx";

import "./styles/tokens.css";
import "./styles/motion.css";
import "./styles/header-actions.css";
import "./styles/global.css";

createRoot(
    document.getElementById("root")
).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <ChatProvider>
                    <App />
                </ChatProvider>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);
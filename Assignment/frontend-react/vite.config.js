import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        react()
    ],

    server: {
        port: 5173,
        strictPort: true,

        proxy: {
            "/api": {
                target: "http://localhost:8080",
                changeOrigin: true,

                /*
                 * /api/ws/chat WebSocket Upgrade 요청도
                 * Spring 서버로 전달한다.
                 */
                ws: true,

                rewrite: function (path) {
                    return path.replace(
                        /^\/api/,
                        ""
                    );
                }
            },

            "/uploads": {
                target: "http://localhost:8080",
                changeOrigin: true
            }
        }
    }
});
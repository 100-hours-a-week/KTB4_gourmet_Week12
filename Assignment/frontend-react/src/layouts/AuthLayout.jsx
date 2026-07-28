import {
    Link,
    Outlet
} from "react-router";

import "../styles/auth.css";

function AuthLayout() {
    return (
        <div className="auth-page">
            <aside
                className="brand-panel"
                aria-label="Gourmet Community 소개"
            >
                <div
                    className="
                        brand-panel__glow
                        brand-panel__glow--top
                    "
                    aria-hidden="true"
                />

                <div
                    className="
                        brand-panel__glow
                        brand-panel__glow--bottom
                    "
                    aria-hidden="true"
                />

                <Link
                    to="/login"
                    className="brand-logo"
                    aria-label="로그인 화면으로 이동"
                >
                    <img
                        src="/images/gourmet-logo.png"
                        alt="Gourmet Community 로고"
                    />
                </Link>

                <div className="brand-copy">
                    <p className="brand-eyebrow">
                        GOURMET COMMUNITY
                    </p>

                    <h1>
                        취향이 모이고,
                        <br />
                        이야기가 이어지는 곳.
                    </h1>

                    <p className="brand-description">
                        자유로운 이야기부터 질문,
                        학습 기록, 프로젝트 모집까지
                        <br />

                        당신의 오늘을 Gourmet에서
                        나눠보세요.
                    </p>
                </div>

                <div
                    className="board-preview"
                    aria-label="주요 게시판"
                >
                    <span>자유게시판</span>
                    <span>질문게시판</span>
                    <span>학습 기록</span>
                    <span>프로젝트 모집</span>
                </div>

                <p className="brand-caption">
                    Share your taste.
                    Build your community.
                </p>
            </aside>

            <main className="auth-main">
                <Outlet />
            </main>
        </div>
    );
}

export default AuthLayout;
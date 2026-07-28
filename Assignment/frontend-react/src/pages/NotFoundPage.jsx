import { Link } from "react-router";

function NotFoundPage() {
    return (
        <main className="auth-placeholder">
            <section className="auth-placeholder-card">
                <p className="placeholder-eyebrow">
                    404
                </p>

                <h1>페이지를 찾을 수 없습니다.</h1>

                <div className="placeholder-links">
                    <Link to="/login">
                        로그인 화면으로 이동
                    </Link>
                </div>
            </section>
        </main>
    );
}

export default NotFoundPage;
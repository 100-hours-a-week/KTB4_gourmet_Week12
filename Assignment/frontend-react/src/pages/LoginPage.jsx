import {useState} from "react";

import {
    Link,
    useLocation,
    useNavigate
} from "react-router";

import useAuth from "../hooks/useAuth.js";

import {
    validateEmail,
    validatePassword
} from "../utils/authValidation.js";


function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        signIn
    } = useAuth();

    const signupNotice =
        typeof location.state?.notice === "string"
            ? location.state.notice
            : "";

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [touched, setTouched] = useState({
        email: false,
        password: false
    });

    const [
        showPassword,
        setShowPassword
    ] = useState(false);

    const [
        isSubmitting,
        setIsSubmitting
    ] = useState(false);

    const [
        serverError,
        setServerError
    ] = useState("");

    const emailError = validateEmail(form.email);


    const passwordError = validatePassword(form.password);


    const isFormValid =
        !emailError &&
        !passwordError;

    function handleInputChange(event) {
        const {
            name,
            value
        } = event.target;

        setForm(function (currentForm) {
            return {
                ...currentForm,
                [name]: value
            };
        });

        setTouched(function (currentTouched) {
            return {
                ...currentTouched,
                [name]: true
            };
        });

        setServerError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setTouched({
            email: true,
            password: true
        });

        if (!isFormValid || isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        setServerError("");

        try {
            await signIn({
                email: form.email.trim(),
                password: form.password
            });

            const previousLocation =
                location.state?.from;

            const redirectPath =
                previousLocation?.pathname
                    ? (
                        previousLocation.pathname +
                        (previousLocation.search ?? "")
                    )
                    : "/boards/free";

            navigate(
                redirectPath,
                {
                    replace: true
                }
            );
        } catch (error) {
            console.error(
                "로그인 요청 오류:",
                error
            );

            setServerError(
                error?.message ??
                "로그인에 실패했습니다."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section
            className="login-card"
            aria-labelledby="login-title"
        >
            <div
                className="mobile-brand"
                aria-hidden="true"
            >
                <img
                    src="/images/gourmet-logo.png"
                    alt=""
                />

                <div>
                    <strong>Gourmet</strong>
                    <span>community</span>
                </div>
            </div>

            <header className="login-card__header">
                <p className="login-eyebrow">
                    WELCOME BACK
                </p>

                <h2 id="login-title">
                    다시 만나 반가워요
                </h2>

                <p>
                    로그인하고 Gourmet의 새로운
                    이야기를 확인해보세요.
                </p>
            </header>

            <p
                className="login-success-message"
                role="status"
                aria-live="polite"
            >
                {signupNotice}
            </p>

            <form
                noValidate
                onSubmit={handleSubmit}
            >
                <div className="input-group">
                    <label htmlFor="email">
                        이메일
                    </label>

                    <div className="input-shell">
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={form.email}
                            placeholder="name@example.com"
                            autoComplete="email"
                            aria-describedby="email-helper"
                            aria-invalid={
                                touched.email &&
                                Boolean(emailError)
                            }
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                        />
                    </div>

                    <p
                        className="helper-text"
                        id="email-helper"
                        aria-live="polite"
                    >
                        {
                            touched.email
                                ? emailError
                                : ""
                        }
                    </p>
                </div>

                <div className="input-group">
                    <label htmlFor="password">
                        비밀번호
                    </label>

                    <div
                        className="
                            input-shell
                            input-shell--password
                        "
                    >
                        <input
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            id="password"
                            name="password"
                            value={form.password}
                            placeholder="비밀번호를 입력하세요"
                            autoComplete="current-password"
                            aria-describedby="password-helper"
                            aria-invalid={
                                touched.password &&
                                Boolean(passwordError)
                            }
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                        />

                        <button
                            type="button"
                            className="password-toggle"
                            aria-label={
                                showPassword
                                    ? "비밀번호 숨기기"
                                    : "비밀번호 표시"
                            }
                            aria-pressed={showPassword}
                            onClick={function () {
                                setShowPassword(
                                    function (current) {
                                        return !current;
                                    }
                                );
                            }}
                            disabled={isSubmitting}
                        >
                            {
                                showPassword
                                    ? "숨김"
                                    : "보기"
                            }
                        </button>
                    </div>

                    <p
                        className="helper-text"
                        id="password-helper"
                        aria-live="polite"
                    >
                        {
                            touched.password
                                ? passwordError
                                : ""
                        }
                    </p>
                </div>

                <p
                    className="login-server-error"
                    role="alert"
                    aria-live="assertive"
                >
                    {serverError}
                </p>

                <button
                    type="submit"
                    className={
                        `primary-button ${
                            isFormValid
                                ? "active"
                                : ""
                        } ${
                            isSubmitting
                                ? "is-loading"
                                : ""
                        }`
                    }
                    disabled={
                        !isFormValid ||
                        isSubmitting
                    }
                    aria-busy={isSubmitting}
                >
                    <span className="button-text">
                        {
                            isSubmitting
                                ? "로그인 중"
                                : "로그인"
                        }
                    </span>

                    <span
                        className="button-arrow"
                        aria-hidden="true"
                    >
                        →
                    </span>
                </button>
            </form>

            <div className="signup-area">
                <span>
                    아직 Gourmet 회원이 아니신가요?
                </span>

                <Link
                    to="/signup"
                    className="signup-button"
                >
                    회원가입
                </Link>
            </div>

            <p className="security-note">
                로그인 정보는 안전한
                HttpOnly Cookie 방식으로 보호됩니다.
            </p>
        </section>
    );
}

export default LoginPage;
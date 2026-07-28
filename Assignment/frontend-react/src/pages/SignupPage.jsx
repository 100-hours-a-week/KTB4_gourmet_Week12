import { useState } from "react";

import {
    Link,
    useNavigate
} from "react-router";

import {
    signup
} from "../api/authApi.js";

import {
    validateEmail,
    validateNickname,
    validatePassword,
    validatePasswordConfirm,
    validateProfileImage
} from "../utils/authValidation.js";

function SignupPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        nickname: "",
        email: "",
        password: "",
        passwordConfirm: ""
    });

    const [touched, setTouched] = useState({
        nickname: false,
        email: false,
        password: false,
        passwordConfirm: false,
        profileImage: false
    });

    const [
        profileImage,
        setProfileImage
    ] = useState(null);

    const [
        showPassword,
        setShowPassword
    ] = useState(false);

    const [
        showPasswordConfirm,
        setShowPasswordConfirm
    ] = useState(false);

    const [
        isSubmitting,
        setIsSubmitting
    ] = useState(false);

    const [
        serverError,
        setServerError
    ] = useState("");

    const nicknameError =
        validateNickname(form.nickname);

    const emailError =
        validateEmail(form.email);

    const passwordError =
        validatePassword(form.password);

    const passwordConfirmError =
        validatePasswordConfirm(
            form.password,
            form.passwordConfirm
        );

    const profileImageError =
        validateProfileImage(profileImage);

    const isFormValid =
        !nicknameError &&
        !emailError &&
        !passwordError &&
        !passwordConfirmError &&
        !profileImageError;

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

    function handleProfileImageChange(event) {
        const file =
            event.target.files?.[0] ?? null;

        setProfileImage(file);

        setTouched(function (currentTouched) {
            return {
                ...currentTouched,
                profileImage: true
            };
        });

        setServerError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setTouched({
            nickname: true,
            email: true,
            password: true,
            passwordConfirm: true,
            profileImage: true
        });

        if (!isFormValid || isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        setServerError("");

        try {
            await signup({
                nickname:
                    form.nickname.trim(),

                email:
                    form.email.trim(),

                password:
                    form.password,

                profileImage
            });

            navigate(
                "/login",
                {
                    replace: true,

                    state: {
                        notice:
                            "회원가입이 완료되었습니다. 로그인해주세요."
                    }
                }
            );
        } catch (error) {
            console.error(
                "회원가입 요청 오류:",
                error
            );

            setServerError(
                error?.message ??
                "회원가입에 실패했습니다."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section
            className="login-card signup-card"
            aria-labelledby="signup-title"
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
                    CREATE ACCOUNT
                </p>

                <h2 id="signup-title">
                    새로운 이야기를 시작해요
                </h2>

                <p>
                    회원 정보를 입력하고
                    Gourmet Community에 참여해보세요.
                </p>
            </header>

            <form
                noValidate
                onSubmit={handleSubmit}
            >
                <div className="input-group">
                    <label htmlFor="nickname">
                        닉네임
                    </label>

                    <div className="input-shell">
                        <input
                            type="text"
                            id="nickname"
                            name="nickname"
                            value={form.nickname}
                            placeholder="사용할 닉네임을 입력하세요"
                            autoComplete="nickname"
                            maxLength={50}
                            aria-describedby="nickname-helper"
                            aria-invalid={
                                touched.nickname &&
                                Boolean(nicknameError)
                            }
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                        />
                    </div>

                    <p
                        className="helper-text"
                        id="nickname-helper"
                        aria-live="polite"
                    >
                        {
                            touched.nickname
                                ? nicknameError
                                : ""
                        }
                    </p>
                </div>

                <div className="input-group">
                    <label htmlFor="signup-email">
                        이메일
                    </label>

                    <div className="input-shell">
                        <input
                            type="email"
                            id="signup-email"
                            name="email"
                            value={form.email}
                            placeholder="name@example.com"
                            autoComplete="email"
                            maxLength={100}
                            aria-describedby="signup-email-helper"
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
                        id="signup-email-helper"
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
                    <label htmlFor="signup-password">
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
                            id="signup-password"
                            name="password"
                            value={form.password}
                            placeholder="비밀번호를 입력하세요"
                            autoComplete="new-password"
                            aria-describedby="signup-password-helper"
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
                        id="signup-password-helper"
                        aria-live="polite"
                    >
                        {
                            touched.password
                                ? passwordError
                                : ""
                        }
                    </p>
                </div>

                <div className="input-group">
                    <label htmlFor="password-confirm">
                        비밀번호 확인
                    </label>

                    <div
                        className="
                            input-shell
                            input-shell--password
                        "
                    >
                        <input
                            type={
                                showPasswordConfirm
                                    ? "text"
                                    : "password"
                            }
                            id="password-confirm"
                            name="passwordConfirm"
                            value={form.passwordConfirm}
                            placeholder="비밀번호를 다시 입력하세요"
                            autoComplete="new-password"
                            aria-describedby="password-confirm-helper"
                            aria-invalid={
                                touched.passwordConfirm &&
                                Boolean(
                                    passwordConfirmError
                                )
                            }
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                        />

                        <button
                            type="button"
                            className="password-toggle"
                            aria-label={
                                showPasswordConfirm
                                    ? "비밀번호 확인 숨기기"
                                    : "비밀번호 확인 표시"
                            }
                            aria-pressed={
                                showPasswordConfirm
                            }
                            onClick={function () {
                                setShowPasswordConfirm(
                                    function (current) {
                                        return !current;
                                    }
                                );
                            }}
                            disabled={isSubmitting}
                        >
                            {
                                showPasswordConfirm
                                    ? "숨김"
                                    : "보기"
                            }
                        </button>
                    </div>

                    <p
                        className="helper-text"
                        id="password-confirm-helper"
                        aria-live="polite"
                    >
                        {
                            touched.passwordConfirm
                                ? passwordConfirmError
                                : ""
                        }
                    </p>
                </div>

                <div className="input-group">
                    <label htmlFor="profile-image">
                        프로필 이미지
                    </label>

                    <div className="profile-image-field">
                        <input
                            type="file"
                            id="profile-image"
                            name="profileImage"
                            accept="image/*"
                            onChange={
                                handleProfileImageChange
                            }
                            disabled={isSubmitting}
                        />

                        <p className="selected-file-name">
                            {
                                profileImage
                                    ? profileImage.name
                                    : "선택하지 않으면 기본 이미지가 사용됩니다."
                            }
                        </p>
                    </div>

                    <p
                        className="helper-text"
                        aria-live="polite"
                    >
                        {
                            touched.profileImage
                                ? profileImageError
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
                                ? "가입 중"
                                : "회원가입"
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
                    이미 Gourmet 회원이신가요?
                </span>

                <Link
                    to="/login"
                    className="signup-button"
                >
                    로그인
                </Link>
            </div>
        </section>
    );
}

export default SignupPage;
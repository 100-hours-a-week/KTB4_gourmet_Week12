import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router";

import {
    updatePassword
} from "../api/userApi.js";

import useAuth from
    "../hooks/useAuth.js";

import {
    validatePassword,
    validatePasswordConfirm
} from "../utils/authValidation.js";

import "../styles/profile.css";

function PasswordChangePage() {
    const navigate =
        useNavigate();

    const {
        currentUser,
        clearAuthentication
    } = useAuth();

    const [
        form,
        setForm
    ] = useState({
        currentPassword: "",
        newPassword: "",
        passwordConfirm: ""
    });

    const [
        visible,
        setVisible
    ] = useState({
        currentPassword: false,
        newPassword: false,
        passwordConfirm: false
    });

    const [
        isSubmitting,
        setIsSubmitting
    ] = useState(false);

    const [
        error,
        setError
    ] = useState("");

    useEffect(function () {
        document.title =
            "비밀번호 변경 · Gourmet Community";
    }, []);

    const currentPasswordError =
        form.currentPassword
            ? ""
            : "현재 비밀번호를 입력해주세요.";

    const newPasswordError =
        validatePassword(
            form.newPassword
        );

    const confirmError =
        validatePasswordConfirm(
            form.newPassword,
            form.passwordConfirm
        );

    const isFormValid =
        !currentPasswordError &&
        !newPasswordError &&
        !confirmError;

    function handleChange(event) {
        const {
            name,
            value
        } = event.target;

        setForm(function (current) {
            return {
                ...current,
                [name]: value
            };
        });

        setError("");
    }

    function toggleVisibility(name) {
        setVisible(function (current) {
            return {
                ...current,
                [name]: !current[name]
            };
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (
            !isFormValid ||
            isSubmitting
        ) {
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            await updatePassword({
                userId:
                    currentUser?.id,

                currentPassword:
                    form.currentPassword,

                newPassword:
                    form.newPassword
            });

            clearAuthentication();

            navigate(
                "/login",
                {
                    replace: true,

                    state: {
                        notice:
                            "비밀번호가 변경되었습니다. 다시 로그인해주세요."
                    }
                }
            );
        } catch (requestError) {
            console.error(
                "비밀번호 변경 오류:",
                requestError
            );

            setError(
                requestError?.message ??
                "비밀번호 변경에 실패했습니다."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    const passwordFields = [
        {
            name: "currentPassword",
            label: "현재 비밀번호",
            placeholder:
                "현재 비밀번호를 입력하세요",
            error:
                currentPasswordError
        },
        {
            name: "newPassword",
            label: "새 비밀번호",
            placeholder:
                "새 비밀번호를 입력하세요",
            error:
                newPasswordError
        },
        {
            name: "passwordConfirm",
            label: "새 비밀번호 확인",
            placeholder:
                "새 비밀번호를 다시 입력하세요",
            error:
                confirmError
        }
    ];

    return (
        <div className="profile-page">
            <div className="profile-toolbar">
                <button
                    type="button"
                    onClick={function () {
                        navigate(
                            "/profile/edit"
                        );
                    }}
                >
                    <span aria-hidden="true">
                        ‹
                    </span>

                    회원정보로
                </button>
            </div>

            <section className="profile-card password-card">
                <header className="profile-header">
                    <p>Security</p>

                    <h1>
                        비밀번호 변경
                    </h1>

                    <span>
                        안전한 계정 보호를 위해 현재
                        비밀번호를 확인합니다.
                    </span>
                </header>

                <form
                    noValidate
                    onSubmit={handleSubmit}
                >
                    {
                        passwordFields.map(
                            function (field) {
                                return (
                                    <div
                                        className="profile-form-group"
                                        key={field.name}
                                    >
                                        <label
                                            htmlFor={
                                                field.name
                                            }
                                        >
                                            {field.label}
                                        </label>

                                        <div className="profile-password-field">
                                            <input
                                                type={
                                                    visible[
                                                        field.name
                                                    ]
                                                        ? "text"
                                                        : "password"
                                                }
                                                id={
                                                    field.name
                                                }
                                                name={
                                                    field.name
                                                }
                                                value={
                                                    form[
                                                        field.name
                                                    ]
                                                }
                                                placeholder={
                                                    field.placeholder
                                                }
                                                autoComplete={
                                                    field.name ===
                                                    "currentPassword"
                                                        ? "current-password"
                                                        : "new-password"
                                                }
                                                disabled={
                                                    isSubmitting
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                            <button
                                                type="button"
                                                disabled={
                                                    isSubmitting
                                                }
                                                onClick={function () {
                                                    toggleVisibility(
                                                        field.name
                                                    );
                                                }}
                                            >
                                                {
                                                    visible[
                                                        field.name
                                                    ]
                                                        ? "숨김"
                                                        : "보기"
                                                }
                                            </button>
                                        </div>

                                        <p className="profile-helper">
                                            {field.error}
                                        </p>
                                    </div>
                                );
                            }
                        )
                    }

                    <p
                        className="profile-error"
                        role="alert"
                    >
                        {error}
                    </p>

                    <div className="profile-button-row">
                        <button
                            type="button"
                            className="profile-secondary-button"
                            disabled={
                                isSubmitting
                            }
                            onClick={function () {
                                navigate(
                                    "/profile/edit"
                                );
                            }}
                        >
                            취소
                        </button>

                        <button
                            type="submit"
                            className="profile-primary-button"
                            disabled={
                                !isFormValid ||
                                isSubmitting
                            }
                        >
                            {
                                isSubmitting
                                    ? "변경 중"
                                    : "비밀번호 변경"
                            }
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default PasswordChangePage;
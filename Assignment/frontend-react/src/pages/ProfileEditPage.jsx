import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    useNavigate
} from "react-router";

import {
    deleteAccount,
    updateProfile
} from "../api/userApi.js";

import ConfirmModal from
    "../components/common/ConfirmModal.jsx";

import useAuth from
    "../hooks/useAuth.js";

import {
    resolveAssetUrl
} from "../utils/assetUrl.js";

import "../styles/profile.css";

const MAX_PROFILE_IMAGE_SIZE =
    5 * 1024 * 1024;

function validateNickname(nickname) {
    const value =
        nickname.trim();

    if (!value) {
        return "닉네임을 입력해주세요.";
    }

    if (value.length > 50) {
        return "닉네임은 50자 이하로 입력해주세요.";
    }

    return "";
}

function validateProfileImage(file) {
    if (!file) {
        return "";
    }

    if (!file.type.startsWith("image/")) {
        return "이미지 파일만 선택할 수 있습니다.";
    }

    if (
        file.size >
        MAX_PROFILE_IMAGE_SIZE
    ) {
        return "프로필 이미지는 5MB 이하만 가능합니다.";
    }

    return "";
}

function ProfileEditPage() {
    const navigate =
        useNavigate();

    const imageInputRef =
        useRef(null);

    const {
        currentUser,
        replaceCurrentUser,
        clearAuthentication
    } = useAuth();

    const [
        nickname,
        setNickname
    ] = useState(
        currentUser?.nickname ?? ""
    );

    const [
        profileImage,
        setProfileImage
    ] = useState(null);

    const [
        previewUrl,
        setPreviewUrl
    ] = useState("");

    const [
        isSubmitting,
        setIsSubmitting
    ] = useState(false);

    const [
        isDeleting,
        setIsDeleting
    ] = useState(false);

    const [
        isDeleteModalOpen,
        setIsDeleteModalOpen
    ] = useState(false);

    const [
        error,
        setError
    ] = useState("");

    const [
        notice,
        setNotice
    ] = useState("");

    useEffect(function () {
        setNickname(
            currentUser?.nickname ?? ""
        );
    }, [currentUser?.nickname]);

    useEffect(function () {
        if (!profileImage) {
            setPreviewUrl("");
            return undefined;
        }

        const objectUrl =
            URL.createObjectURL(
                profileImage
            );

        setPreviewUrl(objectUrl);

        return function () {
            URL.revokeObjectURL(
                objectUrl
            );
        };
    }, [profileImage]);

    useEffect(function () {
        document.title =
            "회원정보 수정 · Gourmet Community";
    }, []);

    const nicknameError =
        validateNickname(nickname);

    const imageError =
        validateProfileImage(
            profileImage
        );

    const isFormValid =
        !nicknameError &&
        !imageError;

    const currentProfileImage =
        resolveAssetUrl(
            currentUser?.profileImage
        );

    const displayedProfileImage =
        previewUrl ||
        currentProfileImage;

    function handleImageChange(event) {
        const file =
            event.target.files?.[0] ??
            null;

        setProfileImage(file);
        setError("");
        setNotice("");
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
        setNotice("");

        try {
            const updatedUser =
                await updateProfile({
                    userId:
                        currentUser?.id,

                    nickname:
                        nickname.trim(),

                    profileImage
                });

            replaceCurrentUser(
                updatedUser
            );

            setProfileImage(null);

            if (imageInputRef.current) {
                imageInputRef.current.value =
                    "";
            }

            setNotice(
                "회원정보가 수정되었습니다."
            );
        } catch (requestError) {
            console.error(
                "회원정보 수정 오류:",
                requestError
            );

            setError(
                requestError?.message ??
                "회원정보 수정에 실패했습니다."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    async function confirmDeleteAccount() {
        if (isDeleting) {
            return;
        }

        setIsDeleting(true);
        setError("");

        try {
            await deleteAccount(
                currentUser?.id
            );

            clearAuthentication();

            navigate(
                "/login",
                {
                    replace: true,

                    state: {
                        notice:
                            "회원 탈퇴가 완료되었습니다."
                    }
                }
            );
        } catch (requestError) {
            console.error(
                "회원 탈퇴 오류:",
                requestError
            );

            setError(
                requestError?.message ??
                "회원 탈퇴에 실패했습니다."
            );

            setIsDeleteModalOpen(false);
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <>
            <div className="profile-page">
                <div className="profile-toolbar">
                    <button
                        type="button"
                        onClick={function () {
                            navigate(
                                "/boards/free"
                            );
                        }}
                    >
                        <span aria-hidden="true">
                            ‹
                        </span>

                        게시판으로
                    </button>
                </div>

                <section className="profile-card">
                    <header className="profile-header">
                        <p>
                            Edit Profile
                        </p>

                        <h1>
                            회원정보 수정
                        </h1>

                        <span>
                            닉네임과 프로필 이미지를
                            변경할 수 있습니다.
                        </span>
                    </header>

                    <form
                        noValidate
                        onSubmit={handleSubmit}
                    >
                        <div className="profile-image-preview">
                            {
                                displayedProfileImage
                                    ? (
                                        <img
                                            src={
                                                displayedProfileImage
                                            }
                                            alt="프로필 미리보기"
                                        />
                                    )
                                    : (
                                        <span aria-hidden="true">
                                            {
                                                (
                                                    nickname ||
                                                    "회"
                                                )
                                                    .charAt(0)
                                                    .toUpperCase()
                                            }
                                        </span>
                                    )
                            }
                        </div>

                        <div className="profile-form-group">
                            <label htmlFor="profile-email">
                                이메일
                            </label>

                            <input
                                type="email"
                                id="profile-email"
                                value={
                                    currentUser?.email ??
                                    ""
                                }
                                disabled
                            />

                            <p className="profile-guide">
                                이메일은 수정할 수 없습니다.
                            </p>
                        </div>

                        <div className="profile-form-group">
                            <label htmlFor="profile-nickname">
                                닉네임
                            </label>

                            <input
                                type="text"
                                id="profile-nickname"
                                value={nickname}
                                maxLength={50}
                                disabled={
                                    isSubmitting
                                }
                                aria-invalid={
                                    Boolean(
                                        nicknameError
                                    )
                                }
                                onChange={function (
                                    event
                                ) {
                                    setNickname(
                                        event.target.value
                                    );

                                    setError("");
                                    setNotice("");
                                }}
                            />

                            <p className="profile-helper">
                                {nicknameError}
                            </p>
                        </div>

                        <div className="profile-form-group">
                            <label htmlFor="profile-image">
                                프로필 이미지
                            </label>

                            <div className="profile-file-field">
                                <label
                                    htmlFor="profile-image"
                                    className="profile-file-button"
                                >
                                    이미지 선택
                                </label>

                                <span>
                                    {
                                        profileImage
                                            ? profileImage.name
                                            : "새 이미지를 선택하지 않으면 기존 이미지를 유지합니다."
                                    }
                                </span>

                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    id="profile-image"
                                    accept="image/*"
                                    disabled={
                                        isSubmitting
                                    }
                                    onChange={
                                        handleImageChange
                                    }
                                />
                            </div>

                            <p className="profile-helper">
                                {imageError}
                            </p>
                        </div>

                        <p
                            className="profile-notice"
                            role="status"
                        >
                            {notice}
                        </p>

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
                                        "/profile/password"
                                    );
                                }}
                            >
                                비밀번호 변경
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
                                        ? "저장 중"
                                        : "수정 완료"
                                }
                            </button>
                        </div>
                    </form>

                    <section className="account-danger-zone">
                        <div>
                            <h2>회원 탈퇴</h2>

                            <p>
                                탈퇴 후에는 계정을 복구할 수
                                없습니다.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={function () {
                                setIsDeleteModalOpen(
                                    true
                                );
                            }}
                        >
                            회원 탈퇴
                        </button>
                    </section>
                </section>
            </div>

            <ConfirmModal
                isOpen={
                    isDeleteModalOpen
                }
                title="정말 탈퇴하시겠습니까?"
                description="계정 정보는 탈퇴 회원 상태로 변경되며 다시 복구할 수 없습니다."
                confirmLabel="회원 탈퇴"
                isProcessing={isDeleting}
                onCancel={function () {
                    if (!isDeleting) {
                        setIsDeleteModalOpen(
                            false
                        );
                    }
                }}
                onConfirm={
                    confirmDeleteAccount
                }
            />
        </>
    );
}

export default ProfileEditPage;
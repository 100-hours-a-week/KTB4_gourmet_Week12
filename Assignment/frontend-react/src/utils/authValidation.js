const EMAIL_PATTERN =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_PATTERN =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,20}$/;

const MAX_PROFILE_IMAGE_SIZE =
    5 * 1024 * 1024;

export function validateEmail(email) {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
        return "이메일을 입력해주세요.";
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
        return "올바른 이메일 주소 형식을 입력해주세요.";
    }

    if (normalizedEmail.length > 100) {
        return "이메일은 100자 이하로 입력해주세요.";
    }

    return "";
}

export function validateNickname(nickname) {
    const normalizedNickname = nickname.trim();

    if (!normalizedNickname) {
        return "닉네임을 입력해주세요.";
    }

    if (normalizedNickname.length > 50) {
        return "닉네임은 50자 이하로 입력해주세요.";
    }

    return "";
}

export function validatePassword(password) {
    if (!password) {
        return "비밀번호를 입력해주세요.";
    }

    if (!PASSWORD_PATTERN.test(password)) {
        return "8~20자 영문 대·소문자, 숫자, 특수문자를 각각 1개 이상 포함해주세요.";
    }

    return "";
}

export function validatePasswordConfirm(
    password,
    passwordConfirm
) {
    if (!passwordConfirm) {
        return "비밀번호 확인을 입력해주세요.";
    }

    if (password !== passwordConfirm) {
        return "비밀번호가 일치하지 않습니다.";
    }

    return "";
}

export function validateProfileImage(file) {
    if (!file) {
        return "";
    }

    if (!file.type.startsWith("image/")) {
        return "이미지 파일만 선택할 수 있습니다.";
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
        return "프로필 이미지는 5MB 이하만 업로드할 수 있습니다.";
    }

    return "";
}
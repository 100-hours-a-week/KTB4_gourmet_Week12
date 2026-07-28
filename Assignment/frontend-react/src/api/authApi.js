async function readResponseBody(response) {
    return response
        .json()
        .catch(function () {
            return null;
        });
}

function createRequestError(
    response,
    data,
    fallbackMessage
) {
    const error = new Error(
        data?.message ?? fallbackMessage
    );

    error.status = response.status;
    error.data = data;

    return error;
}

function getLoginErrorMessage(status, data) {
    if (status === 400) {
        return data?.message ??
            "로그인 입력값을 확인해주세요.";
    }

    if (status === 401) {
        return "이메일 또는 비밀번호를 확인해주세요.";
    }

    if (status === 403) {
        return data?.message ??
            "요청이 서버 보안 정책에 의해 거부되었습니다.";
    }

    if (status === 409) {
        return data?.message ??
            "이미 로그인된 상태입니다.";
    }

    if (status >= 500) {
        return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    }

    return data?.message ??
        "로그인에 실패했습니다.";
}

function getSignupErrorMessage(status, data) {
    if (status === 400) {
        return data?.message ??
            "회원가입 입력값을 확인해주세요.";
    }

    if (status === 409) {
        return data?.message ??
            "이미 사용 중인 이메일 또는 닉네임입니다.";
    }

    if (status === 413) {
        return "업로드한 이미지 파일의 크기가 너무 큽니다.";
    }

    if (status === 415) {
        return "지원하지 않는 요청 형식입니다.";
    }

    if (status >= 500) {
        return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    }

    return data?.message ??
        "회원가입에 실패했습니다.";
}

export async function login({
    email,
    password
}) {
    const response = await fetch(
        "/api/users/login",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            credentials: "include",

            body: JSON.stringify({
                email,
                password
            })
        }
    );

    const data =
        await readResponseBody(response);

    if (!response.ok) {
        throw createRequestError(
            response,
            data,
            getLoginErrorMessage(
                response.status,
                data
            )
        );
    }

    if (!data?.user?.id) {
        throw new Error(
            "로그인 응답에 사용자 정보가 없습니다."
        );
    }

    return data;
}

export async function signup({
    email,
    password,
    nickname,
    profileImage
}) {
    const formData = new FormData();

    formData.append(
        "email",
        email
    );

    formData.append(
        "password",
        password
    );

    formData.append(
        "nickname",
        nickname
    );

    if (profileImage) {
        formData.append(
            "profileImage",
            profileImage
        );
    }

    const response = await fetch(
        "/api/users/signup",
        {
            method: "POST",
            credentials: "include",
            body: formData
        }
    );

    const data =
        await readResponseBody(response);

    if (!response.ok) {
        throw createRequestError(
            response,
            data,
            getSignupErrorMessage(
                response.status,
                data
            )
        );
    }

    return data;
}

export async function logout() {
    const response = await fetch(
        "/api/users/logout",
        {
            method: "POST",
            credentials: "include"
        }
    );

    if (response.status === 204) {
        return;
    }

    const data = await response
        .json()
        .catch(function () {
            return null;
        });

    throw createRequestError(
        response,
        data,
        data?.message ??
            "로그아웃에 실패했습니다."
    );
}

export async function getCurrentUser() {
    const response = await fetch(
        "/api/users/me",
        {
            method: "GET",
            credentials: "include"
        }
    );

    if (response.status === 401) {
        return null;
    }

    const data =
        await readResponseBody(response);

    if (!response.ok) {
        throw createRequestError(
            response,
            data,
            data?.message ??
                "로그인 사용자 정보를 불러오지 못했습니다."
        );
    }

    return data;
}
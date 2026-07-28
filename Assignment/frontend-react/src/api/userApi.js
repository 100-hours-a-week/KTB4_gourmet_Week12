async function readResponseBody(response) {
    return response
        .json()
        .catch(function () {
            return null;
        });
}

function createUserRequestError(
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

export async function updateProfile({
    userId,
    nickname,
    profileImage
}) {
    const numericUserId =
        Number(userId);

    if (
        !Number.isInteger(numericUserId) ||
        numericUserId < 1
    ) {
        throw new Error(
            "로그인 사용자 정보가 올바르지 않습니다."
        );
    }

    const formData =
        new FormData();

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
        `/api/users/${numericUserId}`,
        {
            method: "PATCH",
            credentials: "include",
            body: formData
        }
    );

    const data =
        await readResponseBody(response);

    if (!response.ok) {
        let fallbackMessage =
            "회원정보 수정에 실패했습니다.";

        if (response.status === 409) {
            fallbackMessage =
                "이미 사용 중인 닉네임입니다.";
        }

        throw createUserRequestError(
            response,
            data,
            fallbackMessage
        );
    }

    return data;
}

export async function updatePassword({
    userId,
    currentPassword,
    newPassword
}) {
    const numericUserId =
        Number(userId);

    if (
        !Number.isInteger(numericUserId) ||
        numericUserId < 1
    ) {
        throw new Error(
            "로그인 사용자 정보가 올바르지 않습니다."
        );
    }

    const response = await fetch(
        `/api/users/${numericUserId}/password`,
        {
            method: "PATCH",

            headers: {
                "Content-Type":
                    "application/json"
            },

            credentials: "include",

            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        }
    );

    const data =
        await readResponseBody(response);

    if (!response.ok) {
        throw createUserRequestError(
            response,
            data,
            response.status === 401
                ? "현재 비밀번호를 확인해주세요."
                : "비밀번호 변경에 실패했습니다."
        );
    }

    return data;
}

export async function deleteAccount(
    userId
) {
    const numericUserId =
        Number(userId);

    if (
        !Number.isInteger(numericUserId) ||
        numericUserId < 1
    ) {
        throw new Error(
            "로그인 사용자 정보가 올바르지 않습니다."
        );
    }

    const response = await fetch(
        `/api/users/${numericUserId}`,
        {
            method: "DELETE",
            credentials: "include"
        }
    );

    if (response.status === 204) {
        return;
    }

    const data =
        await readResponseBody(response);

    throw createUserRequestError(
        response,
        data,
        "회원 탈퇴에 실패했습니다."
    );
}
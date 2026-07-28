const API_BASE_URL = "http://localhost:8080";

//accessToken 남겨둔 이유는 이전 방식으로 브라우저에 남아 있던 찌꺼기 제거용
function clearLoginStorage() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("nickname");
    localStorage.removeItem("profileImage");
}

function getErrorMessage(status, data) {
    if (data && data.message) {
        return data.message;
    }

    if (status === 400) {
        return "잘못된 요청입니다.";
    }

    if (status === 401) {
        return "로그인이 필요합니다.";
    }

    if (status === 403) {
        return "접근 권한이 없습니다.";
    }

    if (status === 404) {
        return "요청한 데이터를 찾을 수 없습니다.";
    }

    if (status === 409) {
        return "이미 존재하는 데이터입니다.";
    }

    if (status >= 500) {
        return "서버 오류가 발생했습니다.";
    }

    return "API 요청에 실패했습니다.";
}

async function refreshTokenCookie() {
    const response = await fetch(`${API_BASE_URL}/users/token/refresh`, {
        method: "POST",
        credentials: "include"
    });

    return response.ok;
}

async function apiFetch(path, options = {}, retry = true) {
    const headers = new Headers(options.headers || {});

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
        credentials: "include"
    });

    if (response.status === 204) {
        return null;
    }

    const data = await response.json().catch(function () {
        return null;
    });

    if (!response.ok) {
        if (response.status === 401 && retry) {
            const refreshed = await refreshTokenCookie();

            if (refreshed) {
                return apiFetch(path, options, false);
            }

            clearLoginStorage();
            alert("로그인이 필요합니다.");
            window.location.href = "./login.html";
            return null;
        }

        const errorMessage = getErrorMessage(response.status, data);

        if (response.status === 403) {
            alert(errorMessage);
        }

        throw new Error(errorMessage);
    }

    return data;
}
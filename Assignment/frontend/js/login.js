const loginForm = document.querySelector("#login-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const emailHelper = document.querySelector("#email-helper");
const passwordHelper = document.querySelector("#password-helper");
const loginButton = document.querySelector("#login-button");
const signupButton = document.querySelector("#signup-button");

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPassword(password) {
    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,20}$/;

    return passwordRegex.test(password);
}

function validateLoginForm() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    emailHelper.textContent = "";
    passwordHelper.textContent = "";

    let isValid = true;

    if (email === "") {
        emailHelper.textContent = "* 이메일을 입력해주세요.";
        isValid = false;
    } else if (!isValidEmail(email)) {
        emailHelper.textContent = "* 올바른 이메일 주소 형식을 입력해주세요.";
        isValid = false;
    }

    if (password === "") {
        passwordHelper.textContent = "* 비밀번호를 입력해주세요.";
        isValid = false;
    } else if (!isValidPassword(password)) {
        passwordHelper.textContent =
            "* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
        isValid = false;
    }

    if (isValid) {
        loginButton.disabled = false;
        loginButton.classList.add("active");
    } else {
        loginButton.disabled = true;
        loginButton.classList.remove("active");
    }

    return isValid;
}

emailInput.addEventListener("input", validateLoginForm);
passwordInput.addEventListener("input", validateLoginForm);

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const isValid = validateLoginForm();

    if (!isValid) {
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    try {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json().catch(function () {
            return null;
        });

        if (!response.ok) {
            console.log("로그인 실패:", data);
            passwordHelper.textContent = "* 아이디 또는 비밀번호를 확인해주세요.";
            return;
        }

        console.log("로그인 성공:", data);

        localStorage.removeItem("accessToken");
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("email", data.user.email ?? "");
        localStorage.setItem("nickname", data.user.nickname ?? "");
        localStorage.setItem("profileImage", data.user.profileImage ?? "");

        window.location.href = "./posts.html";
    } catch (error) {
        console.error("로그인 요청 오류:", error);
        passwordHelper.textContent = "* 서버와 연결할 수 없습니다.";
    }
});

signupButton.addEventListener("click", function () {
    window.location.href = "./signup.html";
});
const signupForm = document.querySelector("#signup-form");

const backButton = document.querySelector("#back-button");
const loginButton = document.querySelector("#login-button");
const signupButton = document.querySelector("#signup-button");

const profileImageInput = document.querySelector("#profile-image");
const profilePreview = document.querySelector("#profile-preview");
const profileImg = document.querySelector("#profile-img");
const profilePlus = document.querySelector("#profile-plus");

const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const passwordCheckInput = document.querySelector("#password-check");
const nicknameInput = document.querySelector("#nickname");

const profileHelper = document.querySelector("#profile-helper");
const emailHelper = document.querySelector("#email-helper");
const passwordHelper = document.querySelector("#password-helper");
const passwordCheckHelper = document.querySelector("#password-check-helper");
const nicknameHelper = document.querySelector("#nickname-helper");

let selectedProfileImage = null;

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPassword(password) {
    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,20}$/;

    return passwordRegex.test(password);
}

function isValidNickname(nickname) {
    const hasSpace = /\s/.test(nickname);
    return nickname.length > 0 && nickname.length <= 10 && !hasSpace;
}

function validateSignupForm() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const passwordCheck = passwordCheckInput.value.trim();
    const nickname = nicknameInput.value.trim();

    profileHelper.textContent = "";
    emailHelper.textContent = "";
    passwordHelper.textContent = "";
    passwordCheckHelper.textContent = "";
    nicknameHelper.textContent = "";

    let isValid = true;

    if (!selectedProfileImage) {
        profileHelper.textContent = "* 프로필 사진을 추가해주세요.";
        isValid = false;
    }

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
            "* 비밀번호는 8자 이상, 20자 이하이며 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
        isValid = false;
    }

    if (passwordCheck === "") {
        passwordCheckHelper.textContent = "* 비밀번호를 한번 더 입력해주세요.";
        isValid = false;
    } else if (password !== passwordCheck) {
        passwordCheckHelper.textContent = "* 비밀번호가 다릅니다.";
        isValid = false;
    }

    if (nickname === "") {
        nicknameHelper.textContent = "* 닉네임을 입력해주세요.";
        isValid = false;
    } else if (/\s/.test(nickname)) {
        nicknameHelper.textContent = "* 띄어쓰기를 없애주세요.";
        isValid = false;
    } else if (nickname.length > 10) {
        nicknameHelper.textContent = "* 닉네임은 최대 10자까지 작성 가능합니다.";
        isValid = false;
    }

    if (isValid) {
        signupButton.disabled = false;
        signupButton.classList.add("active");
    } else {
        signupButton.disabled = true;
        signupButton.classList.remove("active");
    }

    return isValid;
}

profileImageInput.addEventListener("change", function () {
    const file = profileImageInput.files[0];

    if (!file) {
        selectedProfileImage = null;
        profileImg.style.display = "none";
        profilePlus.style.display = "block";
        validateSignupForm();
        return;
    }

    selectedProfileImage = file;

    const imageUrl = URL.createObjectURL(file);
    profileImg.src = imageUrl;
    profileImg.style.display = "block";
    profilePlus.style.display = "none";

    validateSignupForm();
});

emailInput.addEventListener("input", validateSignupForm);
passwordInput.addEventListener("input", validateSignupForm);
passwordCheckInput.addEventListener("input", validateSignupForm);
nicknameInput.addEventListener("input", validateSignupForm);

signupForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const isValid = validateSignupForm();

    if (!isValid) {
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const nickname = nicknameInput.value.trim();

    try {
        const formData = new FormData();

        formData.append("email", email);
        formData.append("password", password);
        formData.append("nickname", nickname);

        if (selectedProfileImage) {
            formData.append("profileImage", selectedProfileImage);
        }

        const response = await fetch(`${API_BASE_URL}/users/signup`, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(function () {
                return null;
            });

            const errorMessage = errorData?.message ?? "회원가입에 실패했습니다.";

            emailHelper.textContent = "";
            nicknameHelper.textContent = "";

            if (errorMessage.includes("이메일")) {
                emailHelper.textContent = `* ${errorMessage}`;
                return;
            }

            if (errorMessage.includes("닉네임")) {
                nicknameHelper.textContent = `* ${errorMessage}`;
                return;
            }

            emailHelper.textContent = `* ${errorMessage}`;
            return;
        }

        const user = await response.json();

        console.log("회원가입 성공:", user);
        alert("회원가입이 완료되었습니다.");

        window.location.href = "./login.html";
    } catch (error) {
        console.error("회원가입 요청 오류:", error);
        emailHelper.textContent = "* 서버와 연결할 수 없습니다.";
    }
});

backButton.addEventListener("click", function () {
    window.location.href = "./login.html";
});

loginButton.addEventListener("click", function () {
    window.location.href = "./login.html";
});
const editPasswordForm = document.querySelector("#edit-password-form");
const passwordInput = document.querySelector("#password");
const passwordCheckInput = document.querySelector("#password-check");

const passwordHelper = document.querySelector("#password-helper");
const passwordCheckHelper = document.querySelector("#password-check-helper");

const editButton = document.querySelector("#edit-button");
const toast = document.querySelector("#toast");

function isValidPassword(password) {
    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,20}$/;

    return passwordRegex.test(password);
}

function validatePasswordForm() {
    const password = passwordInput.value.trim();
    const passwordCheck = passwordCheckInput.value.trim();

    passwordHelper.textContent = "";
    passwordCheckHelper.textContent = "";

    let isValid = true;

    if (password === "") {
        passwordHelper.textContent = "* 비밀번호를 입력해주세요.";
        isValid = false;
    } else if (!isValidPassword(password)) {
        passwordHelper.textContent =
            "* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
        isValid = false;
    }

    if (passwordCheck === "") {
        passwordCheckHelper.textContent = "* 비밀번호를 한번 더 입력해주세요.";
        isValid = false;
    } else if (password !== passwordCheck) {
        passwordCheckHelper.textContent = "* 비밀번호와 다릅니다.";
        isValid = false;
    }

    if (isValid) {
        editButton.disabled = false;
        editButton.classList.add("active");
    } else {
        editButton.disabled = true;
        editButton.classList.remove("active");
    }

    return isValid;
}

passwordInput.addEventListener("input", validatePasswordForm);
passwordCheckInput.addEventListener("input", validatePasswordForm);

editPasswordForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const isValid = validatePasswordForm();

    if (!isValid) {
        return;
    }

    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("로그인이 필요합니다.");
        window.location.href = "./login.html";
        return;
    }

    const password = passwordInput.value.trim();

    try {
        const updatedUser = await apiFetch(`/users/${userId}/password`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                password: password
            })
        });

        console.log("비밀번호 수정 성공:", updatedUser);

        passwordInput.value = "";
        passwordCheckInput.value = "";
        validatePasswordForm();

        toast.classList.add("show");

        setTimeout(function () {
            toast.classList.remove("show");
        }, 2000);
    } catch (error) {
        console.error("비밀번호 수정 요청 오류:", error);
        passwordHelper.textContent = `* ${error?.message ?? "비밀번호 수정에 실패했습니다."}`;
    }
});
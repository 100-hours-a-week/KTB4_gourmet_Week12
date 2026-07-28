const editProfileForm = document.querySelector("#edit-profile-form");

const profileImageBox = document.querySelector("#profile-image-box");
const profileImageInput = document.querySelector("#profile-image-input");
const profilePreview = document.querySelector("#profile-preview");

const emailText = document.querySelector("#email-text");
const nicknameInput = document.querySelector("#nickname");
const nicknameHelper = document.querySelector("#nickname-helper");
const editButton = document.querySelector("#edit-button");

const withdrawButton = document.querySelector("#withdraw-button");
const withdrawModal = document.querySelector("#withdraw-modal");
const withdrawCancel = document.querySelector("#withdraw-cancel");
const withdrawConfirm = document.querySelector("#withdraw-confirm");

const toast = document.querySelector("#toast");

let selectedProfileImage = null;

function getLoginUserId() {
    return localStorage.getItem("userId");
}

function getImageUrl(imagePath) {
    if (!imagePath || imagePath === "null" || imagePath === "undefined") {
        return null;
    }

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
    }

    return `${API_BASE_URL}${imagePath}`;
}

function renderProfileImage(profileImage) {
    const imageUrl = getImageUrl(profileImage);

    if (!profileImageBox) {
        return;
    }

    if (!imageUrl) {
        profileImageBox.style.backgroundImage = "";

        if (profilePreview) {
            profilePreview.style.display = "none";
            profilePreview.removeAttribute("src");
        }

        return;
    }

    profileImageBox.style.backgroundImage = `url(${imageUrl})`;
    profileImageBox.style.backgroundSize = "cover";
    profileImageBox.style.backgroundPosition = "center";
    profileImageBox.style.backgroundRepeat = "no-repeat";

    if (profilePreview) {
        profilePreview.style.display = "none";
        profilePreview.removeAttribute("src");
    }
}

function validateNickname() {
    const nickname = nicknameInput.value.trim();

    nicknameHelper.textContent = "";

    if (nickname === "") {
        nicknameHelper.textContent = "* 닉네임을 입력해주세요.";
        editButton.disabled = true;
        editButton.classList.remove("active");
        return false;
    }

    if (/\s/.test(nickname)) {
        nicknameHelper.textContent = "* 띄어쓰기를 없애주세요.";
        editButton.disabled = true;
        editButton.classList.remove("active");
        return false;
    }

    if (nickname.length > 10) {
        nicknameHelper.textContent = "* 닉네임은 최대 10자까지 작성 가능합니다.";
        editButton.disabled = true;
        editButton.classList.remove("active");
        return false;
    }

    editButton.disabled = false;
    editButton.classList.add("active");
    return true;
}

function openModal(modal) {
    modal.classList.add("show");
    document.body.classList.add("modal-open");
}

function closeModal(modal) {
    modal.classList.remove("show");
    document.body.classList.remove("modal-open");
}

async function fetchUserProfile() {
    const userId = getLoginUserId();

    if (!userId) {
        alert("로그인이 필요합니다.");
        window.location.href = "./login.html";
        return;
    }

    try {
        const user = await apiFetch(`/users/${userId}`);

        if (!user) {
            return;
        }

        console.log("회원정보 조회 성공:", user);

        emailText.textContent = user.email ?? "";
        nicknameInput.value = user.nickname ?? "";

        localStorage.setItem("email", user.email ?? "");
        localStorage.setItem("nickname", user.nickname ?? "");
        localStorage.setItem("profileImage", user.profileImage ?? "");

        renderProfileImage(user.profileImage);

        if (typeof renderHeaderProfileImage === "function") {
            renderHeaderProfileImage();
        }

        validateNickname();
    } catch (error) {
        console.error(error);
        alert(error.message ?? "회원정보를 불러오지 못했습니다.");
    }
}

profileImageInput.addEventListener("change", function () {
    const file = profileImageInput.files[0];

    if (!file) {
        selectedProfileImage = null;
        return;
    }

    selectedProfileImage = file;

    const previewUrl = URL.createObjectURL(file);

    profileImageBox.style.backgroundImage = `url(${previewUrl})`;
    profileImageBox.style.backgroundSize = "cover";
    profileImageBox.style.backgroundPosition = "center";
    profileImageBox.style.backgroundRepeat = "no-repeat";

    if (profilePreview) {
        profilePreview.style.display = "none";
        profilePreview.removeAttribute("src");
    }

    console.log("프로필 이미지 변경:", selectedProfileImage);
});

nicknameInput.addEventListener("input", validateNickname);

editProfileForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const isValid = validateNickname();

    if (!isValid) {
        return;
    }

    const userId = getLoginUserId();

    if (!userId) {
        alert("로그인이 필요합니다.");
        window.location.href = "./login.html";
        return;
    }

    const nickname = nicknameInput.value.trim();
    const previousProfileImage = localStorage.getItem("profileImage") ?? "";

    try {
        const formData = new FormData();

        formData.append("nickname", nickname);

        if (selectedProfileImage) {
            formData.append("profileImage", selectedProfileImage);
        }

        const updatedUser = await apiFetch(`/users/${userId}`, {
            method: "PATCH",
            body: formData
        });

        if (!updatedUser) {
            return;
        }

        console.log("회원정보 수정 성공:", updatedUser);

        const nextEmail = updatedUser.email ?? emailText.textContent;
        const nextNickname = updatedUser.nickname ?? nickname;
        const nextProfileImage = updatedUser.profileImage ?? previousProfileImage;

        emailText.textContent = nextEmail;
        nicknameInput.value = nextNickname;

        localStorage.setItem("email", nextEmail);
        localStorage.setItem("nickname", nextNickname);
        localStorage.setItem("profileImage", nextProfileImage ?? "");

        selectedProfileImage = null;

        renderProfileImage(nextProfileImage);

        if (typeof renderHeaderProfileImage === "function") {
            renderHeaderProfileImage();
        }

        toast.classList.add("show");

        setTimeout(function () {
            toast.classList.remove("show");
        }, 2000);
    } catch (error) {
        console.error("회원정보 수정 요청 오류:", error);

        const errorMessage = error?.message ?? "회원정보 수정에 실패했습니다.";

        if (errorMessage.includes("닉네임")) {
            nicknameHelper.textContent = `* ${errorMessage}`;
            return;
        }

        nicknameHelper.textContent = `* ${errorMessage}`;
    }
});

withdrawButton.addEventListener("click", function () {
    openModal(withdrawModal);
});

withdrawCancel.addEventListener("click", function () {
    closeModal(withdrawModal);
});

withdrawConfirm.addEventListener("click", async function () {
    const userId = getLoginUserId();

    if (!userId) {
        alert("로그인이 필요합니다.");
        window.location.href = "./login.html";
        return;
    }

    try {
        await apiFetch(`/users/${userId}`, {
            method: "DELETE"
        });

        await fetch(`${API_BASE_URL}/users/logout`, {
            method: "POST",
            credentials: "include"
        }).catch(function () {
            return null;
        });

        console.log("회원 탈퇴 성공:", userId);

        clearLoginStorage();

        closeModal(withdrawModal);

        alert("회원 탈퇴가 완료되었습니다.");
        window.location.href = "./login.html";
    } catch (error) {
        console.error("회원 탈퇴 요청 오류:", error);
        alert(error?.message ?? "회원 탈퇴에 실패했습니다.");
    }
});

fetchUserProfile();
const headerProfileButton = document.querySelector("#header-profile-button");
const profileDropdown = document.querySelector("#profile-dropdown");

const goEditProfile = document.querySelector("#go-edit-profile");
const goEditPassword = document.querySelector("#go-edit-password");
const logoutButton = document.querySelector("#logout-button");

function getProfileImageUrl(profileImage) {
    if (!profileImage || profileImage === "null" || profileImage === "undefined") {
        return null;
    }

    if (profileImage.startsWith("http://") || profileImage.startsWith("https://")) {
        return profileImage;
    }

    return `${API_BASE_URL}${profileImage}`;
}

if (headerProfileButton && profileDropdown) {
    headerProfileButton.addEventListener("click", function (event) {
        event.stopPropagation();

        const userId = localStorage.getItem("userId");

        if (!userId) {
            alert("로그인이 필요합니다.");
            window.location.href = "./login.html";
            return;
        }

        profileDropdown.classList.toggle("show");
    });

    document.addEventListener("click", function () {
        profileDropdown.classList.remove("show");
    });

    profileDropdown.addEventListener("click", function (event) {
        event.stopPropagation();
    });
}

if (goEditProfile) {
    goEditProfile.addEventListener("click", function () {
        window.location.href = "./edit-profile.html";
    });
}

if (goEditPassword) {
    goEditPassword.addEventListener("click", function () {
        window.location.href = "./edit-password.html";
    });
}

if (logoutButton) {
    logoutButton.addEventListener("click", async function () {
        try {
            await fetch(`${API_BASE_URL}/users/logout`, {
                method: "POST",
                credentials: "include"
            });
        } catch (error) {
            console.error("로그아웃 요청 오류:", error);
        } finally {
            clearLoginStorage();
            window.location.href = "./login.html";
        }
    });
}

function renderHeaderProfileImage() {
    const profileImage = localStorage.getItem("profileImage");
    const profileImageUrl = getProfileImageUrl(profileImage);

    if (!headerProfileButton) {
        return;
    }

    if (!profileImageUrl) {
        headerProfileButton.style.backgroundImage = "";
        return;
    }

    headerProfileButton.style.backgroundImage = `url(${profileImageUrl})`;
    headerProfileButton.style.backgroundSize = "cover";
    headerProfileButton.style.backgroundPosition = "center";
}

renderHeaderProfileImage();
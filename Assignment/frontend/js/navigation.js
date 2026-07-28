const mainLogo = document.querySelector("#main-logo");
const backToPostsButton = document.querySelector("#back-to-posts-button");

if (mainLogo) {
    mainLogo.addEventListener("click", function () {
        window.location.href = "./posts.html";
    });
}

if (backToPostsButton) {
    backToPostsButton.addEventListener("click", function () {
        window.location.href = "./posts.html";
    });
}
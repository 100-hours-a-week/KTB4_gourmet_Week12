const headerSearchForm =
    document.querySelector("#header-search");

const headerSearchInput =
    document.querySelector("#search-input");

if (headerSearchForm && headerSearchInput) {
    headerSearchForm.addEventListener(
        "submit",
        function (event) {
            event.preventDefault();

            const keyword =
                headerSearchInput.value.trim();

            if (!keyword) {
                alert("검색어를 입력해주세요.");
                headerSearchInput.focus();
                return;
            }

            const query = new URLSearchParams({
                keyword: keyword,
                searchType: "ALL",
                sortType: "LATEST",
                page: "0",
                size: "10"
            });

            window.location.href =
                `./search.html?${query.toString()}`;
        }
    );
}
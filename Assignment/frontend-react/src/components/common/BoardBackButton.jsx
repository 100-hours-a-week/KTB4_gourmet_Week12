import {
    useNavigate
} from "react-router";

function BoardBackButton() {
    const navigate =
        useNavigate();

    return (
        <div className="page-back-toolbar">
            <button
                type="button"
                onClick={function () {
                    navigate(
                        "/boards/free"
                    );
                }}
            >
                <span aria-hidden="true">
                    ‹
                </span>

                게시판으로
            </button>
        </div>
    );
}

export default BoardBackButton;

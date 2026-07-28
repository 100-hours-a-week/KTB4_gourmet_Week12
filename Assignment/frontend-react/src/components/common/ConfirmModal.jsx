import { useEffect } from "react";

function ConfirmModal({
    isOpen,
    title,
    description,
    confirmLabel = "확인",
    cancelLabel = "취소",
    isProcessing = false,
    onConfirm,
    onCancel
}) {
    useEffect(function () {
        if (!isOpen) {
            return undefined;
        }

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow =
            "hidden";

        function handleKeyDown(event) {
            if (
                event.key === "Escape" &&
                !isProcessing
            ) {
                onCancel();
            }
        }

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        return function () {
            document.body.style.overflow =
                previousOverflow;

            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [
        isOpen,
        isProcessing,
        onCancel
    ]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="detail-modal-backdrop"
            onMouseDown={function (event) {
                if (
                    event.target ===
                    event.currentTarget &&
                    !isProcessing
                ) {
                    onCancel();
                }
            }}
        >
            <section
                className="detail-confirm-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
            >
                <h2 id="confirm-modal-title">
                    {title}
                </h2>

                <p>{description}</p>

                <div className="detail-modal-buttons">
                    <button
                        type="button"
                        className="detail-modal-cancel"
                        disabled={isProcessing}
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </button>

                    <button
                        type="button"
                        className="detail-modal-confirm"
                        disabled={isProcessing}
                        onClick={onConfirm}
                    >
                        {
                            isProcessing
                                ? "처리 중"
                                : confirmLabel
                        }
                    </button>
                </div>
            </section>
        </div>
    );
}

export default ConfirmModal;
import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    resolveAssetUrl
} from "../../utils/assetUrl.js";

import "../../styles/post-form.css";

const MAX_TITLE_LENGTH = 26;
const MAX_CONTENT_LENGTH = 65535;

const MAX_IMAGE_SIZE =
    5 * 1024 * 1024;

const MAX_TOTAL_IMAGE_SIZE =
    20 * 1024 * 1024;

function validateTitle(title) {
    const value =
        title.trim();

    if (!value) {
        return "제목을 입력해주세요.";
    }

    if (
        value.length >
        MAX_TITLE_LENGTH
    ) {
        return (
            `제목은 ${MAX_TITLE_LENGTH}자 이하로 ` +
            "입력해주세요."
        );
    }

    return "";
}

function validateContent(content) {
    const value =
        content.trim();

    if (!value) {
        return "내용을 입력해주세요.";
    }

    if (
        value.length >
        MAX_CONTENT_LENGTH
    ) {
        return "내용이 너무 깁니다.";
    }

    return "";
}

function validatePeriod(
    periodStart,
    periodEnd
) {
    if (
        !periodStart ||
        !periodEnd
    ) {
        return "모집 기간을 모두 입력해주세요.";
    }

    if (
        periodStart >
        periodEnd
    ) {
        return (
            "모집 종료일은 시작일과 같거나 " +
            "이후여야 합니다."
        );
    }

    return "";
}

function validateImages(images) {
    const invalidType =
        images.find(function (image) {
            return !image.type.startsWith(
                "image/"
            );
        });

    if (invalidType) {
        return "이미지 파일만 선택할 수 있습니다.";
    }

    const oversizedImage =
        images.find(function (image) {
            return (
                image.size >
                MAX_IMAGE_SIZE
            );
        });

    if (oversizedImage) {
        return (
            "각 이미지는 5MB 이하만 " +
            "업로드할 수 있습니다."
        );
    }

    const totalSize =
        images.reduce(
            function (sum, image) {
                return sum + image.size;
            },
            0
        );

    if (
        totalSize >
        MAX_TOTAL_IMAGE_SIZE
    ) {
        return (
            "전체 이미지 용량은 " +
            "20MB 이하로 선택해주세요."
        );
    }

    return "";
}

function PostForm({
    eyebrow,
    heading,
    description,
    titleLabel = "제목",
    titlePlaceholder,
    contentLabel = "내용",
    contentPlaceholder,
    submitLabel,
    showProjectPeriod = false,

    initialValues = {
        title: "",
        content: "",
        periodStart: "",
        periodEnd: ""
    },

    existingImageUrls = [],

    onSubmit,
    onCancel
}) {
    const imageInputRef =
        useRef(null);

    const [
        form,
        setForm
    ] = useState({
        title:
            initialValues.title ?? "",

        content:
            initialValues.content ?? "",

        periodStart:
            initialValues.periodStart ?? "",

        periodEnd:
            initialValues.periodEnd ?? ""
    });

    const [
        images,
        setImages
    ] = useState([]);

    const [
        touched,
        setTouched
    ] = useState({
        title: false,
        content: false,
        period: false,
        images: false
    });

    const [
        isSubmitting,
        setIsSubmitting
    ] = useState(false);

    const [
        submitError,
        setSubmitError
    ] = useState("");

    useEffect(function () {
        setForm({
            title:
                initialValues.title ?? "",

            content:
                initialValues.content ?? "",

            periodStart:
                initialValues.periodStart ?? "",

            periodEnd:
                initialValues.periodEnd ?? ""
        });

        setImages([]);

        setTouched({
            title: false,
            content: false,
            period: false,
            images: false
        });

        setSubmitError("");

        if (imageInputRef.current) {
            imageInputRef.current.value = "";
        }
    }, [
        initialValues.title,
        initialValues.content,
        initialValues.periodStart,
        initialValues.periodEnd
    ]);

    const normalizedExistingImages =
        Array.isArray(existingImageUrls)
            ? existingImageUrls.filter(
                Boolean
            )
            : [];

    const titleError =
        validateTitle(form.title);

    const contentError =
        validateContent(form.content);

    const periodError =
        showProjectPeriod
            ? validatePeriod(
                form.periodStart,
                form.periodEnd
            )
            : "";

    const imageError =
        validateImages(images);

    const isFormValid =
        !titleError &&
        !contentError &&
        !periodError &&
        !imageError;

    function handleInputChange(event) {
        const {
            name,
            value
        } = event.target;

        setForm(function (currentForm) {
            return {
                ...currentForm,
                [name]: value
            };
        });

        const touchedKey =
            name === "periodStart" ||
            name === "periodEnd"
                ? "period"
                : name;

        setTouched(function (
            currentTouched
        ) {
            return {
                ...currentTouched,
                [touchedKey]: true
            };
        });

        setSubmitError("");
    }

    function handleImageChange(event) {
        const selectedImages =
            Array.from(
                event.target.files ?? []
            );

        setImages(selectedImages);

        setTouched(function (
            currentTouched
        ) {
            return {
                ...currentTouched,
                images: true
            };
        });

        setSubmitError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setTouched({
            title: true,
            content: true,
            period: showProjectPeriod,
            images: true
        });

        if (
            !isFormValid ||
            isSubmitting
        ) {
            return;
        }

        setIsSubmitting(true);
        setSubmitError("");

        try {
            await onSubmit({
                title:
                    form.title.trim(),

                content:
                    form.content.trim(),

                periodStart:
                    form.periodStart,

                periodEnd:
                    form.periodEnd,

                images
            });
        } catch (error) {
            console.error(
                "게시글 저장 오류:",
                error
            );

            setSubmitError(
                error?.message ??
                "게시글 저장에 실패했습니다."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    let fileDescription =
        "선택된 이미지가 없습니다.";

    if (
        images.length === 0 &&
        normalizedExistingImages.length > 0
    ) {
        fileDescription =
            "새 이미지를 선택하지 않으면 기존 이미지를 유지합니다.";
    }

    if (images.length === 1) {
        fileDescription =
            images[0].name;
    }

    if (images.length > 1) {
        fileDescription =
            `${images[0].name} 외 ` +
            `${images.length - 1}개`;
    }

    return (
        <div className="post-form-page">
            <div className="post-form-toolbar">
                <button
                    type="button"
                    className="post-form-back-button"
                    disabled={isSubmitting}
                    onClick={onCancel}
                >
                    <span aria-hidden="true">
                        ‹
                    </span>

                    게시글로
                </button>
            </div>

            <section
                className="post-form-card"
                aria-labelledby="post-form-title"
            >
                <header className="post-form-header">
                    <p className="post-form-eyebrow">
                        {eyebrow}
                    </p>

                    <h1 id="post-form-title">
                        {heading}
                    </h1>

                    <p>
                        {description}
                    </p>
                </header>

                <form
                    noValidate
                    onSubmit={handleSubmit}
                >
                    <div className="post-form-group">
                        <label htmlFor="post-title">
                            {titleLabel}*
                        </label>

                        <input
                            type="text"
                            id="post-title"
                            name="title"
                            value={form.title}
                            maxLength={
                                MAX_TITLE_LENGTH
                            }
                            placeholder={
                                titlePlaceholder
                            }
                            aria-describedby="post-title-helper"
                            aria-invalid={
                                touched.title &&
                                Boolean(titleError)
                            }
                            disabled={isSubmitting}
                            onChange={
                                handleInputChange
                            }
                        />

                        <div className="post-form-field-meta">
                            <p
                                id="post-title-helper"
                                className="post-form-helper"
                                aria-live="polite"
                            >
                                {
                                    touched.title
                                        ? titleError
                                        : ""
                                }
                            </p>

                            <span>
                                {form.title.length}
                                /{MAX_TITLE_LENGTH}
                            </span>
                        </div>
                    </div>

                    {
                        showProjectPeriod && (
                            <div className="post-form-group">
                                <label>
                                    모집 기간*
                                </label>

                                <div className="post-period-row">
                                    <div>
                                        <span>
                                            시작일
                                        </span>

                                        <input
                                            type="date"
                                            name="periodStart"
                                            value={
                                                form.periodStart
                                            }
                                            aria-label="모집 시작일"
                                            disabled={
                                                isSubmitting
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                        />
                                    </div>

                                    <span
                                        className="post-period-separator"
                                        aria-hidden="true"
                                    >
                                        ~
                                    </span>

                                    <div>
                                        <span>
                                            종료일
                                        </span>

                                        <input
                                            type="date"
                                            name="periodEnd"
                                            value={
                                                form.periodEnd
                                            }
                                            aria-label="모집 종료일"
                                            disabled={
                                                isSubmitting
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                        />
                                    </div>
                                </div>

                                <p
                                    className="post-form-helper"
                                    aria-live="polite"
                                >
                                    {
                                        touched.period
                                            ? periodError
                                            : ""
                                    }
                                </p>
                            </div>
                        )
                    }

                    <div className="post-form-group">
                        <label htmlFor="post-content">
                            {contentLabel}*
                        </label>

                        <textarea
                            id="post-content"
                            name="content"
                            value={form.content}
                            maxLength={
                                MAX_CONTENT_LENGTH
                            }
                            placeholder={
                                contentPlaceholder
                            }
                            aria-describedby="post-content-helper"
                            aria-invalid={
                                touched.content &&
                                Boolean(contentError)
                            }
                            disabled={isSubmitting}
                            onChange={
                                handleInputChange
                            }
                        />

                        <div className="post-form-field-meta">
                            <p
                                id="post-content-helper"
                                className="post-form-helper"
                                aria-live="polite"
                            >
                                {
                                    touched.content
                                        ? contentError
                                        : ""
                                }
                            </p>

                            <span>
                                {form.content.length}
                                /{MAX_CONTENT_LENGTH}
                            </span>
                        </div>
                    </div>

                    <div className="post-form-group">
                        <label>
                            이미지
                        </label>

                        {
                            normalizedExistingImages.length >
                                0 && (
                                <div className="existing-image-section">
                                    <p>
                                        현재 이미지
                                    </p>

                                    <div className="existing-image-list">
                                        {
                                            normalizedExistingImages.map(
                                                function (
                                                    imageUrl,
                                                    index
                                                ) {
                                                    return (
                                                        <img
                                                            key={
                                                                `${imageUrl}-${index}`
                                                            }
                                                            src={
                                                                resolveAssetUrl(
                                                                    imageUrl
                                                                )
                                                            }
                                                            alt={
                                                                `기존 이미지 ${
                                                                    index + 1
                                                                }`
                                                            }
                                                        />
                                                    );
                                                }
                                            )
                                        }
                                    </div>
                                </div>
                            )
                        }

                        <div className="post-image-field">
                            <label
                                htmlFor="post-images"
                                className="post-image-select-button"
                            >
                                파일 선택
                            </label>

                            <span className="post-image-file-name">
                                {fileDescription}
                            </span>

                            <input
                                ref={imageInputRef}
                                type="file"
                                id="post-images"
                                accept="image/*"
                                multiple
                                disabled={
                                    isSubmitting
                                }
                                onChange={
                                    handleImageChange
                                }
                            />
                        </div>

                        {
                            images.length > 1 && (
                                <ul className="post-image-name-list">
                                    {
                                        images.map(
                                            function (
                                                image,
                                                index
                                            ) {
                                                return (
                                                    <li
                                                        key={
                                                            `${image.name}-${image.size}-${index}`
                                                        }
                                                    >
                                                        {image.name}
                                                    </li>
                                                );
                                            }
                                        )
                                    }
                                </ul>
                            )
                        }

                        <p
                            className="post-form-helper"
                            aria-live="polite"
                        >
                            {
                                touched.images
                                    ? imageError
                                    : ""
                            }
                        </p>

                        <p className="post-image-guide">
                            {
                                normalizedExistingImages.length >
                                0
                                    ? (
                                        "새 이미지를 선택하지 않으면 기존 이미지를 유지하며, " +
                                        "새 이미지를 선택하면 기존 이미지 전체를 교체합니다."
                                    )
                                    : (
                                        "이미지 파일만 가능하며, 파일당 5MB·전체 20MB 이하로 선택해주세요."
                                    )
                            }
                        </p>
                    </div>

                    <p
                        className="post-form-submit-error"
                        role="alert"
                        aria-live="assertive"
                    >
                        {submitError}
                    </p>

                    <div className="post-form-button-row">
                        <button
                            type="button"
                            className="post-form-cancel-button"
                            disabled={isSubmitting}
                            onClick={onCancel}
                        >
                            취소
                        </button>

                        <button
                            type="submit"
                            className={
                                `post-form-submit-button ${
                                    isFormValid
                                        ? "active"
                                        : ""
                                }`
                            }
                            disabled={
                                !isFormValid ||
                                isSubmitting
                            }
                        >
                            {
                                isSubmitting
                                    ? "저장 중"
                                    : submitLabel
                            }
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default PostForm;
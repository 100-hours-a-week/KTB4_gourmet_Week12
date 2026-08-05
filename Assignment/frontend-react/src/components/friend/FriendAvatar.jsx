import {
    resolveAssetUrl
} from "../../utils/assetUrl.js";

function FriendAvatar({
    nickname,
    profileImage,
    size = "medium"
}) {
    const imageUrl =
        resolveAssetUrl(profileImage);

    const initial =
        String(nickname ?? "?")
            .trim()
            .charAt(0)
            .toUpperCase();

    return (
        <span
            className={[
                "friend-avatar",
                `is-${size}`
            ].join(" ")}
            aria-hidden="true"
        >
            {
                imageUrl
                    ? (
                        <img
                            src={imageUrl}
                            alt=""
                        />
                    )
                    : (
                        <span>
                            {initial || "?"}
                        </span>
                    )
            }
        </span>
    );
}

export default FriendAvatar;
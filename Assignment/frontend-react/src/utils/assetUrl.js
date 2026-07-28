export function resolveAssetUrl(path) {
    if (!path) {
        return "";
    }

    const value =
        String(path).trim();

    if (
        value.startsWith("http://") ||
        value.startsWith("https://") ||
        value.startsWith("data:") ||
        value.startsWith("blob:")
    ) {
        return value;
    }

    return value.startsWith("/")
        ? value
        : `/${value}`;
}
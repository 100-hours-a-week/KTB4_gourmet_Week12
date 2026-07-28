export function formatCount(count) {
    const value = Number(count ?? 0);

    if (!Number.isFinite(value) || value <= 0) {
        return "0";
    }

    if (value >= 1000) {
        return `${Math.floor(value / 1000)}k`;
    }

    return String(value);
}

export function formatDate(dateValue) {
    if (!dateValue) {
        return "";
    }

    const date =
        new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return String(dateValue)
            .replace("T", " ")
            .slice(0, 19);
    }

    return new Intl.DateTimeFormat(
        "ko-KR",
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }
    ).format(date);
}
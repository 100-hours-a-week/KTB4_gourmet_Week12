export function buildProjectContent(
    periodStart,
    periodEnd,
    content
) {
    return (
        `[모집기간] ${periodStart} ~ ${periodEnd}` +
        `\n\n${content}`
    );
}

export function parseProjectContent(
    rawContent
) {
    const text =
        String(rawContent ?? "");

    const matched = text.match(
        /^\[모집기간\]\s*(.+?)\s*~\s*(.+?)(?:\r?\n\r?\n([\s\S]*))?$/
    );

    if (!matched) {
        return {
            periodStart: null,
            periodEnd: null,
            content: text
        };
    }

    return {
        periodStart:
            matched[1].trim(),

        periodEnd:
            matched[2].trim(),

        content:
            (matched[3] ?? "").trim()
    };
}
export function createClientMessageId() {
    const cryptoApi =
        globalThis.crypto;

    /*
     * HTTPS 또는 localhost처럼
     * randomUUID를 지원하는 환경
     */
    if (
        cryptoApi
        && typeof cryptoApi.randomUUID
            === "function"
    ) {
        return cryptoApi.randomUUID();
    }

    /*
     * HTTP 공인 IP 환경에서는 randomUUID가
     * 없을 수 있으므로 getRandomValues로
     * UUID v4를 직접 생성한다.
     */
    if (
        !cryptoApi
        || typeof cryptoApi.getRandomValues
            !== "function"
    ) {
        throw new Error(
            "메시지 식별값을 생성할 수 없는 브라우저입니다."
        );
    }

    const bytes =
        new Uint8Array(16);

    cryptoApi.getRandomValues(bytes);

    /*
     * UUID version 4
     */
    bytes[6] =
        (bytes[6] & 0x0f) | 0x40;

    /*
     * RFC 4122 variant
     */
    bytes[8] =
        (bytes[8] & 0x3f) | 0x80;

    const hex =
        Array.from(
            bytes,
            function (byte) {
                return byte
                    .toString(16)
                    .padStart(2, "0");
            }
        ).join("");

    return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20, 32)
    ].join("-");
}
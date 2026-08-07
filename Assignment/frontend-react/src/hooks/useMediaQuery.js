import { useEffect, useState } from "react";

/**
 * Matches a CSS media query. Useful for responsive layout decisions
 * (e.g. collapsing the board sidebar on narrow viewports).
 */
function useMediaQuery(query) {
    const [
        matches,
        setMatches
    ] = useState(function () {
        if (
            typeof window === "undefined"
            || typeof window.matchMedia
                !== "function"
        ) {
            return false;
        }

        return window
            .matchMedia(query)
            .matches;
    });

    useEffect(
        function () {
            if (
                typeof window === "undefined"
                || typeof window.matchMedia
                    !== "function"
            ) {
                return undefined;
            }

            const mediaQueryList =
                window.matchMedia(query);

            function handleChange(
                event
            ) {
                setMatches(
                    event.matches
                );
            }

            setMatches(
                mediaQueryList.matches
            );

            if (
                typeof mediaQueryList.addEventListener
                === "function"
            ) {
                mediaQueryList.addEventListener(
                    "change",
                    handleChange
                );

                return function () {
                    mediaQueryList.removeEventListener(
                        "change",
                        handleChange
                    );
                };
            }

            mediaQueryList.addListener(
                handleChange
            );

            return function () {
                mediaQueryList.removeListener(
                    handleChange
                );
            };
        },
        [query]
    );

    return matches;
}

export default useMediaQuery;

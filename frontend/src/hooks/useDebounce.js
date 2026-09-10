import { useState, useEffect } from "react";

/**
 * Returns a copy of the value that only updates once the input has been
 * idle for the given delay, which prevents a request on every keystroke.
 */
export default function useDebounce(value, delay = 400) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);

        // Each new keystroke cancels the pending update from the previous one
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
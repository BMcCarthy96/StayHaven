import { useEffect, useState } from "react";

const THEME_KEY = "stayhaven-theme";

export default function ThemeToggle() {
    const [dark, setDark] = useState(() => {
        const stored = localStorage.getItem(THEME_KEY);
        if (stored) return stored === "dark";
        return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    });

    useEffect(() => {
        document.body.classList.toggle("dark-theme", dark);
        localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    }, [dark]);

    return (
        <button
            type="button"
            className="theme-toggle-btn"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setDark((d) => !d)}
        >
            {dark ? "☀️" : "🌙"}
        </button>
    );
}

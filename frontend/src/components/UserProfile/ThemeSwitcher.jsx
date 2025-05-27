import { useState, useEffect } from "react";

export default function ThemeSwitcher() {
    const [dark, setDark] = useState(() =>
        document.body.classList.contains("dark-theme")
    );

    useEffect(() => {
        if (dark) {
            document.body.classList.add("dark-theme");
        } else {
            document.body.classList.remove("dark-theme");
        }
    }, [dark]);

    return (
        <button
            aria-label="Toggle theme"
            onClick={() => setDark((d) => !d)}
            style={{
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                marginLeft: "12px",
            }}
        >
            {dark ? "🌙" : "☀️"}
        </button>
    );
}

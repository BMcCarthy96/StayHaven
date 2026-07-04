import { motion } from "framer-motion";
import "./Button.css";

export default function Button({
    variant = "primary",
    size,
    fullWidth,
    className = "",
    children,
    ...rest
}) {
    const classes = [
        "btn",
        `btn-${variant}`,
        size === "sm" ? "btn-sm" : "",
        fullWidth ? "btn-full" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <motion.button
            className={classes}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            {...rest}
        >
            {children}
        </motion.button>
    );
}

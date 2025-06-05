import "./NotFound.css";
import { motion } from "framer-motion";

export default function NotFound() {
    return (
        <div className="notfound-root">
            <h1>404 - Page Not Found</h1>
            <p>Sorry, we couldn&apos;t find that page.</p>
            <motion.a
                href="/"
                className="save-btn"
                aria-label="Go Home"
                tabIndex={0}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.03 }}
            >
                Go Home
            </motion.a>
        </div>
    );
}

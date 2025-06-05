import { useDispatch } from "react-redux";
import { logout } from "../../store/session";
import "./DeleteAccountModal.css";
import { motion } from "framer-motion";

export default function DeleteAccountModal({ onClose }) {
    const dispatch = useDispatch();
    const handleDelete = async () => {
        try {
            const res = await fetch("/api/users/delete", { method: "DELETE" });
            if (res.ok) {
                dispatch(logout());
                window.location.href = "/";
            }
        } catch {
            // Optionally show error
        }
    };

    return (
        <div
            className="delete-account-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
        >
            <h2 id="delete-account-title">Delete Account</h2>
            <p>
                Are you sure you want to delete your account? This cannot be
                undone.
            </p>
            <div className="modal-actions">
                <motion.button
                    className="save-btn"
                    onClick={handleDelete}
                    aria-label="Yes, Delete"
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.03 }}
                >
                    Yes, Delete
                </motion.button>
                <motion.button
                    className="cancel-btn"
                    onClick={onClose}
                    aria-label="Cancel"
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.03 }}
                >
                    Cancel
                </motion.button>
            </div>
        </div>
    );
}

import { useDispatch } from "react-redux";
import { logout } from "../../store/session";
import "./DeleteAccountModal.css";

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
        <div className="delete-account-modal">
            <h2>Delete Account</h2>
            <p>
                Are you sure you want to delete your account? This cannot be
                undone.
            </p>
            <div className="modal-actions">
                <button className="save-btn" onClick={handleDelete}>
                    Yes, Delete
                </button>
                <button className="cancel-btn" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </div>
    );
}

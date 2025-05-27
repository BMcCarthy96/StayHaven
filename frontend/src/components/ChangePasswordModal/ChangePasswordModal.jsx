import { useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../store/session";
import "./ChangePasswordModal.css";

export default function ChangePasswordModal({ onClose }) {
    const dispatch = useDispatch();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        try {
            const res = await fetch("/api/users/change-password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Failed to change password.");
            } else {
                setSuccess("Password changed! Please log in again.");
                setTimeout(() => {
                    dispatch(logout());
                    window.location.href = "/";
                }, 1500);
            }
        } catch {
            setError("Failed to change password.");
        }
    };

    return (
        <div className="change-password-modal">
            <h2>Change Password</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Current Password
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                    />
                </label>
                <label>
                    New Password
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </label>
                <label>
                    Confirm New Password
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </label>
                {error && <div className="error-msg">{error}</div>}
                {success && <div className="success-msg">{success}</div>}
                <div className="modal-actions">
                    <button type="submit" className="save-btn">
                        Change Password
                    </button>
                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

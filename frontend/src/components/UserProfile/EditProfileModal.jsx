import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import "./EditProfileModal.css";
import { motion } from "framer-motion";
import { updateUserProfile } from "../../store/session";

export default function EditProfileModal({ user, onClose, onSave }) {
    const dispatch = useDispatch();
    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);
    const [email, setEmail] = useState(user.email || "");
    const [bio, setBio] = useState(user.bio || "");
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
    const [error, setError] = useState(null);

    useEffect(() => {
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setEmail(user.email || "");
        setBio(user.bio || "");
        setAvatarUrl(user.avatarUrl || "");
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const payload = {
            firstName,
            lastName,
            email,
            bio,
        };
        if (avatarUrl && avatarUrl.trim() !== "") {
            payload.avatarUrl = avatarUrl;
        }

        try {
            await dispatch(updateUserProfile(payload));
            onSave();
        } catch (err) {
            setError("Failed to update profile. Please try again.");
        }
    };

    return (
        <div
            className="edit-profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
        >
            <h2 id="edit-profile-title">Edit Profile</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    First Name
                    <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        aria-label="First Name"
                        tabIndex={0}
                    />
                </label>
                <label>
                    Last Name
                    <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        aria-label="Last Name"
                        tabIndex={0}
                    />
                </label>
                <label>
                    Email
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        aria-label="Email"
                        tabIndex={0}
                    />
                </label>
                <label>
                    Bio
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        aria-label="Bio"
                        tabIndex={0}
                    />
                </label>
                <label>
                    Avatar URL
                    <input
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        aria-label="Avatar URL"
                        tabIndex={0}
                    />
                </label>
                {error && <div className="edit-profile-error">{error}</div>}
                <div className="edit-profile-actions">
                    <motion.button
                        type="submit"
                        className="save-btn"
                        aria-label="Save changes"
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ scale: 1.03 }}
                    >
                        Save
                    </motion.button>
                    <motion.button
                        type="button"
                        className="cancel-btn"
                        aria-label="Cancel"
                        onClick={onClose}
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ scale: 1.03 }}
                    >
                        Cancel
                    </motion.button>
                </div>
            </form>
        </div>
    );
}

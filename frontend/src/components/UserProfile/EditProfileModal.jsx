import { useState } from "react";
import { useDispatch } from "react-redux";
import { updateUserProfile } from "../../store/session";
import "./EditProfileModal.css";

export default function EditProfileModal({ user, onClose, onSave }) {
    const dispatch = useDispatch();
    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);
    const [bio, setBio] = useState(user.bio || "");
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await dispatch(
                updateUserProfile({ firstName, lastName, bio, avatarUrl })
            );
            onSave();
        } catch (err) {
            setError("Failed to update profile. Please try again.");
        }
    };

    return (
        <div className="edit-profile-modal">
            <h2>Edit Profile</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    First Name
                    <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Last Name
                    <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Bio
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                    />
                </label>
                <label>
                    Avatar URL
                    <input
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                    />
                </label>
                {error && <div className="edit-profile-error">{error}</div>}
                <div className="edit-profile-actions">
                    <button type="submit" className="save-btn">
                        Save
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

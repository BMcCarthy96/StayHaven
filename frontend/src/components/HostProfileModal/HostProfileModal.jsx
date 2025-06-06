import { useSelector } from "react-redux";
import { useModal } from "../../context/Modal";
import "./HostProfileModal.css";
import { motion } from "framer-motion";

export default function HostProfileModal({
    host,
    bio,
    badges,
    email,
    joinDate,
}) {
    const { closeModal } = useModal();
    const allSpots = useSelector((state) => state.spots.allSpots || {});
    if (!host)
        return (
            <div
                className="host-profile-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="host-profile-title"
            >
                No host info available.
            </div>
        );

    const hostSpots = Object.values(allSpots).filter(
        (spot) => spot.ownerId === host.id
    );

    return (
        <div
            className="host-profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="host-profile-title"
        >
            <h2 id="host-profile-title">Host Profile</h2>
            <div className="host-profile-avatar">
                {host.firstName ? host.firstName[0].toUpperCase() : "?"}
            </div>
            <div className="host-profile-name">
                {host.firstName} {host.lastName}
            </div>
            <div className="host-profile-email">{email || host.email}</div>
            <div className="host-profile-joined">
                Joined:{" "}
                {joinDate
                    ? new Date(joinDate).toLocaleDateString()
                    : host.createdAt
                    ? new Date(host.createdAt).toLocaleDateString()
                    : "Unknown"}
            </div>
            <div className="host-profile-bio">
                {bio ||
                    host.bio ||
                    "Superhost with excellent reviews and a passion for hospitality!"}
            </div>
            {badges && (
                <div className="host-profile-badges">
                    {badges.map((badge, i) => (
                        <span key={i} className="host-badge">
                            {badge}
                        </span>
                    ))}
                </div>
            )}
            <div className="host-profile-listings">
                <h3>Other Listings by Host</h3>
                {hostSpots.length === 0 ? (
                    <div>No other listings.</div>
                ) : (
                    <ul>
                        {hostSpots.map((spot) => (
                            <li key={spot.id}>
                                <a href={`/spots/${spot.id}`}>{spot.name}</a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <motion.button
                className="close-btn"
                onClick={closeModal}
                aria-label="Close host profile"
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.03 }}
            >
                Close
            </motion.button>
        </div>
    );
}

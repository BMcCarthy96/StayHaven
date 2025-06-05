import { useSelector } from "react-redux";
import "./HostProfileModal.css";
import { motion } from "framer-motion";

export default function HostProfileModal({ host, onClose }) {
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
            <div className="host-profile-email">{host.email}</div>
            <div className="host-profile-joined">
                Joined:{" "}
                {host.createdAt
                    ? new Date(host.createdAt).toLocaleDateString()
                    : "Unknown"}
            </div>
            <div className="host-profile-bio">
                {/* Example bio or placeholder */}
                Superhost with excellent reviews and a passion for hospitality!
            </div>
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
                onClick={onClose}
                aria-label="Close host profile"
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.03 }}
            >
                Close
            </motion.button>
        </div>
    );
}

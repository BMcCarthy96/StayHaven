import "./HostProfileModal.css";

export default function HostProfileModal({ host }) {
    if (!host)
        return (
            <div className="host-profile-modal">No host info available.</div>
        );
    return (
        <div className="host-profile-modal">
            <div className="host-profile-avatar">
                {host.firstName ? host.firstName[0].toUpperCase() : "?"}
            </div>
            <div className="host-profile-name">
                {host.firstName} {host.lastName}
            </div>
            <div className="host-profile-email">{host.email}</div>
            {/* Add more host info or a bio if available */}
            <div className="host-profile-bio">
                {/* Example bio or placeholder */}
                Superhost with excellent reviews and a passion for hospitality!
            </div>
        </div>
    );
}

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import gravatarUrl from "gravatar-url";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./UserProfile.css";
import EditProfileModal from "./EditProfileModal";
import ChangePasswordModal from "../ChangePasswordModal";
import DeleteAccountModal from "../DeleteAccountModal";
import { fetchUserBookings } from "../../store/bookings";
import { fetchWishlist } from "../../store/wishlist";
import { fetchUserReviews } from "../../store/reviews";
import { fetchSpots } from "../../store/spots";
import ThemeSwitcher from "./ThemeSwitcher";

const TABS = ["My Spots", "My Reviews", "My Bookings", "Wishlist", "Settings"];

function UserProfile() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.session.user);
    const bookings = useSelector((state) => state.bookings.bookings || []);
    const wishlist = useSelector((state) => state.wishlist.spots || []);
    const userReviews = useSelector((state) => state.reviews.userReviews || {});
    const allSpots = useSelector((state) => state.spots.allSpots || {});

    const [activeTab, setActiveTab] = useState(TABS[0]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Example data for timeline and achievements
    const timeline = [
        { type: "booking", date: "2024-05-01", desc: "Booked 'Cozy Cabin'" },
        {
            type: "review",
            date: "2024-05-03",
            desc: "Reviewed 'Ocean View Loft'",
        },
        { type: "spot", date: "2024-05-10", desc: "Listed 'Urban Retreat'" },
    ];
    const achievements = [
        { label: "First Booking", icon: "🏅" },
        { label: "Superhost", icon: "🌟" },
        { label: "10+ Reviews", icon: "💬" },
    ];

    useEffect(() => {
        if (user) {
            dispatch(fetchUserBookings());
            dispatch(fetchWishlist());
            dispatch(fetchUserReviews());
            dispatch(fetchSpots());
        }
    }, [dispatch, user]);

    useEffect(() => {
        if (!user) return;
        document.title = `${user.firstName}'s Profile | StayHaven`;
    }, [user]);

    if (!user) return <div className="profile-loading">Loading...</div>;

    // Filter spots owned by the user
    const mySpots = Object.values(allSpots).filter(
        (spot) => spot.ownerId === user.id
    );

    return (
        <div className="profile-root" role="main">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="profile-header">
                <div className="profile-avatar-wrapper">
                    <img
                        src={
                            user.avatarUrl && user.avatarUrl.trim() !== ""
                                ? user.avatarUrl
                                : user.email
                                ? gravatarUrl(user.email, {
                                      size: 100,
                                      default: "retro",
                                  })
                                : "https://img.freepik.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg?semt=ais_hybrid&w=740"
                        }
                        alt={`${user.firstName} ${user.lastName} avatar`}
                        className="profile-avatar"
                        loading="lazy"
                    />
                    <motion.button
                        className="edit-avatar-btn"
                        aria-label="Edit Profile"
                        onClick={() => setShowEditModal(true)}
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ scale: 1.03 }}
                    >
                        ✏️
                    </motion.button>
                </div>
                <div className="profile-info">
                    <h2 tabIndex={0}>
                        {user.firstName} {user.lastName}
                    </h2>
                    <div className="profile-badges" aria-label="Achievements">
                        {achievements.map((a, i) => (
                            <span
                                key={i}
                                className="profile-badge"
                                title={a.label}
                                aria-label={a.label}
                            >
                                {a.icon}
                            </span>
                        ))}
                    </div>
                    <div className="profile-bio" tabIndex={0}>
                        {user.bio || "No bio yet. Click edit to add one!"}
                    </div>
                    <div className="profile-joined" tabIndex={0}>
                        Joined:{" "}
                        {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "Unknown"}
                    </div>
                </div>
                <div className="theme-switcher-wrapper">
                    <ThemeSwitcher />
                </div>
            </div>

            {/* Tabs */}
            <div className="profile-tabs" role="tablist">
                {TABS.map((tab) => (
                    <motion.button
                        key={tab}
                        className={`profile-tab${
                            activeTab === tab ? " active" : ""
                        }`}
                        onClick={() => setActiveTab(tab)}
                        role="tab"
                        aria-selected={activeTab === tab}
                        tabIndex={activeTab === tab ? 0 : -1}
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ scale: 1.03 }}
                    >
                        {tab}
                    </motion.button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="profile-tab-content">
                {activeTab === "My Spots" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {mySpots.length === 0 ? (
                            <div className="profile-placeholder">
                                Your listed spots will appear here.
                            </div>
                        ) : (
                            mySpots.map((spot) => (
                                <div
                                    key={spot.id}
                                    className="profile-spot-card"
                                >
                                    <div>
                                        <strong>{spot.name}</strong>
                                        <div>
                                            {spot.city}, {spot.state}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </motion.div>
                )}
                {activeTab === "My Reviews" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {Object.values(userReviews).length === 0 ? (
                            <div className="profile-placeholder">
                                Your reviews will appear here.
                            </div>
                        ) : (
                            Object.values(userReviews).map((review) => (
                                <div
                                    key={review.id}
                                    className="profile-review-card"
                                >
                                    <div>
                                        <strong>{review.Spot?.name}</strong>
                                        <div>{review.review}</div>
                                        <div>Stars: {review.stars}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </motion.div>
                )}
                {activeTab === "My Bookings" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {bookings.length === 0 ? (
                            <div className="profile-placeholder">
                                Your bookings will appear here.
                            </div>
                        ) : (
                            bookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="profile-booking-card"
                                >
                                    <div>
                                        <strong>{booking.Spot?.name}</strong>
                                        <div>
                                            {booking.startDate} -{" "}
                                            {booking.endDate}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </motion.div>
                )}
                {activeTab === "Wishlist" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {wishlist.length === 0 ? (
                            <div className="profile-placeholder">
                                Your wishlist will appear here.
                            </div>
                        ) : (
                            wishlist.map((spot) => (
                                <div
                                    key={spot.id}
                                    className="profile-wishlist-card"
                                >
                                    <div>
                                        <strong>{spot.name}</strong>
                                        <div>
                                            {spot.city}, {spot.state}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </motion.div>
                )}
                {activeTab === "Settings" && (
                    <div className="profile-settings">
                        <motion.button
                            className="save-btn"
                            onClick={() => {
                                setShowPasswordModal(true);
                                setShowDeleteModal(false);
                            }}
                            aria-label="Change Password"
                            whileTap={{ scale: 0.97 }}
                            whileHover={{ scale: 1.03 }}
                        >
                            Change Password
                        </motion.button>
                        <motion.button
                            className="cancel-btn"
                            onClick={() => {
                                setShowDeleteModal(true);
                                setShowPasswordModal(false);
                            }}
                            aria-label="Delete Account"
                            whileTap={{ scale: 0.97 }}
                            whileHover={{ scale: 1.03 }}
                        >
                            Delete Account
                        </motion.button>
                    </div>
                )}
            </div>

            {/* Activity Timeline */}
            <div className="profile-timeline-section">
                <h3>Activity Timeline</h3>
                <div className="profile-timeline">
                    {timeline.map((item, idx) => (
                        <motion.div
                            key={idx}
                            className={`timeline-item timeline-${item.type}`}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            tabIndex={0}
                            aria-label={item.desc}
                        >
                            <span className="timeline-date">{item.date}</span>
                            <span className="timeline-desc">{item.desc}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <EditProfileModal
                    user={user}
                    onClose={() => setShowEditModal(false)}
                    onSave={() => {
                        toast.success("Profile updated!");
                        setShowEditModal(false);
                    }}
                />
            )}
            {showPasswordModal && (
                <ChangePasswordModal
                    onClose={() => setShowPasswordModal(false)}
                />
            )}
            {showDeleteModal && (
                <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />
            )}
        </div>
    );
}

export default UserProfile;

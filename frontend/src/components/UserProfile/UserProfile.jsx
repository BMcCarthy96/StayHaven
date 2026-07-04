import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import gravatarUrl from "gravatar-url";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { MdOutlineStar } from "react-icons/md";
import "./UserProfile.css";
import EditProfileModal from "./EditProfileModal";
import ChangePasswordModal from "../ChangePasswordModal";
import DeleteAccountModal from "../DeleteAccountModal";
import { fetchUserBookings } from "../../store/bookings";
import { fetchWishlist } from "../../store/wishlist";
import { fetchUserReviews } from "../../store/reviews";
import { fetchSpots } from "../../store/spots";
import SpotCard from "../SpotCard/SpotCard";

const TABS = ["My Spots", "My Reviews", "My Bookings", "Wishlist", "Settings"];
const PREVIEW_COUNT = 3;

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
                    <div className="profile-bio">
                        {user.bio ? (
                            <span tabIndex={0}>{user.bio}</span>
                        ) : (
                            <button
                                type="button"
                                className="profile-bio-edit-link"
                                onClick={() => setShowEditModal(true)}
                            >
                                No bio yet. Click here to add one!
                            </button>
                        )}
                    </div>
                    <div className="profile-joined" tabIndex={0}>
                        Joined:{" "}
                        {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "Unknown"}
                    </div>
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
                            <div className="spot-grid">
                                {mySpots.map((spot) => (
                                    <SpotCard key={spot.id} spot={spot} />
                                ))}
                            </div>
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
                            <div className="profile-list">
                                {Object.values(userReviews)
                                    .sort(
                                        (a, b) =>
                                            new Date(b.createdAt) -
                                            new Date(a.createdAt)
                                    )
                                    .map((review) => (
                                        <Link
                                            to={`/spots/${review.spotId}`}
                                            key={review.id}
                                            className="profile-review-card"
                                        >
                                            <img
                                                src={review.Spot?.previewImage}
                                                alt={review.Spot?.name}
                                                className="profile-list-thumb"
                                                loading="lazy"
                                            />
                                            <div className="profile-list-body">
                                                <div className="profile-review-top">
                                                    <strong>
                                                        {review.Spot?.name}
                                                    </strong>
                                                    <span className="profile-review-stars">
                                                        {[...Array(5)].map(
                                                            (_, i) => (
                                                                <MdOutlineStar
                                                                    key={i}
                                                                    style={{
                                                                        color:
                                                                            i <
                                                                            review.stars
                                                                                ? "var(--color-rating)"
                                                                                : "var(--color-border)",
                                                                    }}
                                                                />
                                                            )
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="profile-review-text">
                                                    {review.review}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                            </div>
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
                            <>
                                <div className="profile-list">
                                    {bookings
                                        .slice(0, PREVIEW_COUNT)
                                        .map((booking) => (
                                            <Link
                                                to={`/spots/${booking.spotId}`}
                                                key={booking.id}
                                                className="profile-booking-card"
                                            >
                                                <img
                                                    src={
                                                        booking.Spot
                                                            ?.previewImage
                                                    }
                                                    alt={booking.Spot?.name}
                                                    className="profile-list-thumb"
                                                    loading="lazy"
                                                />
                                                <div className="profile-list-body">
                                                    <strong>
                                                        {booking.Spot?.name}
                                                    </strong>
                                                    <p className="profile-booking-dates">
                                                        {booking.startDate}
                                                        {" – "}
                                                        {booking.endDate}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                </div>
                                <Link to="/trips" className="profile-view-all-link">
                                    View all trips &rarr;
                                </Link>
                            </>
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
                            <>
                                <div className="spot-grid">
                                    {wishlist.slice(0, PREVIEW_COUNT).map((spot) => (
                                        <SpotCard key={spot.id} spot={spot} />
                                    ))}
                                </div>
                                <Link
                                    to="/wishlist"
                                    className="profile-view-all-link"
                                >
                                    View full wishlist &rarr;
                                </Link>
                            </>
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

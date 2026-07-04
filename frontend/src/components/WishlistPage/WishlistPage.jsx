import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaRegHeart } from "react-icons/fa";
import { fetchWishlist, removeFromWishlist } from "../../store/wishlist";
import SpotCard from "../SpotCard/SpotCard";
import EmptyState from "../ui/EmptyState";
import "./WishlistPage.css";

function WishlistPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.session.user);
    const wishlist = useSelector((state) => state.wishlist.spots || []);

    useEffect(() => {
        if (!user) {
            navigate("/", {
                state: { error: "You must be logged in to view your wishlist" },
                replace: true,
            });
            return;
        }
        dispatch(fetchWishlist());
    }, [dispatch, user, navigate]);

    if (!user) return null;

    return (
        <div className="wishlist-page">
            <h1>My Wishlist</h1>
            {wishlist.length === 0 ? (
                <EmptyState
                    icon={<FaRegHeart />}
                    title="No saved spots yet"
                    message="Tap the heart on any listing to save it here for later."
                />
            ) : (
                <div className="spot-grid">
                    {wishlist.map((spot) => (
                        <SpotCard
                            key={spot.id}
                            spot={spot}
                            isWishlisted
                            onToggleWishlist={() =>
                                dispatch(removeFromWishlist(spot.id))
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default WishlistPage;

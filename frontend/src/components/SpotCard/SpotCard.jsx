import { Link } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import StarRating from "../ui/StarRating";
import PriceTag from "../ui/PriceTag";
import "./SpotCard.css";

function SpotCard({ spot, isWishlisted, onToggleWishlist, variant = "default", footer }) {
    const rating = spot.avgRating ?? spot.avgStarRating;

    const details = [
        spot.guestCapacity && `${spot.guestCapacity} guest${spot.guestCapacity === 1 ? "" : "s"}`,
        spot.bedrooms && `${spot.bedrooms} bd`,
        spot.beds && `${spot.beds} bed${spot.beds === 1 ? "" : "s"}`,
    ]
        .filter(Boolean)
        .join(" · ");

    const handleWishlistClick = (e) => {
        e.preventDefault();
        onToggleWishlist?.(spot);
    };

    return (
        <div className={`spot-card spot-card--${variant}`}>
            <Link
                to={`/spots/${spot.id}`}
                className="spot-card-link"
                aria-label={`View ${spot.name}`}
            >
                <div className="spot-card-image">
                    <img src={spot.previewImage} alt={spot.name} loading="lazy" />
                    {rating >= 4.8 ? (
                        <span className="spot-card-badge spot-card-badge--superhost">
                            Superhost
                        </span>
                    ) : (
                        !rating && <span className="spot-card-badge">New</span>
                    )}
                </div>
                <div className="spot-card-body">
                    <div className="spot-card-row">
                        <h3 className="spot-card-name">{spot.name}</h3>
                        <StarRating rating={rating} />
                    </div>
                    <p className="spot-card-location">
                        {spot.city}, {spot.state}
                    </p>
                    {details && <p className="spot-card-details">{details}</p>}
                    <p className="spot-card-price-row">
                        <PriceTag price={spot.price} />
                    </p>
                </div>
            </Link>
            {onToggleWishlist && (
                <button
                    type="button"
                    className={`spot-card-heart${isWishlisted ? " liked" : ""}`}
                    onClick={handleWishlistClick}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                    <FaHeart />
                </button>
            )}
            {footer && <div className="spot-card-footer">{footer}</div>}
        </div>
    );
}

export default SpotCard;

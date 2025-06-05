import "./UpdateReviewModal.css";
import { IoMdStar } from "react-icons/io";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    modifyReview,
    fetchUserReviews,
    fetchReviewsForSpot,
} from "../../store/reviews";
import { fetchSpotDetails } from "../../store/spots";
import { useModal } from "../../context/Modal";
import { motion } from "framer-motion";

function UpdateReviewModal({
    existingReview,
    existingStars,
    reviewId,
    spotId,
    currentPage,
}) {
    const dispatch = useDispatch();
    const [stars, setStars] = useState(existingStars || 0);
    const [hoverStars, setHoverStars] = useState(0);
    const [reviewText, setReviewText] = useState(existingReview || "");

    const { closeModal } = useModal();

    const spotDetails = useSelector((state) => state.spots.allSpots[spotId]);

    useEffect(() => {
        setReviewText(existingReview);
        setStars(existingStars);
    }, [existingReview, existingStars]);

    const renderStarRating = () => {
        return [0, 1, 2, 3, 4].map((index) => (
            <IoMdStar
                key={index}
                className={
                    index < (hoverStars || stars) ? "filled-star" : "empty-star"
                }
                onClick={() => setStars(index + 1)}
                onMouseEnter={() => setHoverStars(index + 1)}
                onMouseLeave={() => setHoverStars(0)}
                aria-label={`Rate ${index + 1} stars`}
                tabIndex={0}
            />
        ));
    };

    const handleReviewUpdate = async (e) => {
        e.preventDefault();

        try {
            await dispatch(
                modifyReview(reviewId, { review: reviewText, stars })
            );

            if (currentPage === "manage") {
                await dispatch(fetchUserReviews());
            } else if (currentPage === "spot") {
                await dispatch(fetchReviewsForSpot(spotId));
                await dispatch(fetchSpotDetails(spotId));
            }

            closeModal();
        } catch (error) {
            console.error("Error updating review:", error.message);
        }
    };

    return (
        <div
            className="review-modal-container"
            role="dialog"
            aria-modal="true"
            aria-labelledby="update-review-title"
        >
            <div className="header-div">
                <h1 id="update-review-title" className="header-title">
                    How was your stay at {spotDetails?.name}?
                </h1>
            </div>

            <div className="textarea-div">
                <textarea
                    value={reviewText}
                    className="text"
                    placeholder="Leave your review here..."
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                    aria-label="Review"
                    tabIndex={0}
                />
            </div>

            <div className="stars-div" aria-label="Star rating">
                {renderStarRating()}
            </div>

            <div className="button-div">
                <motion.button
                    className="submit-review-button"
                    type="submit"
                    onClick={handleReviewUpdate}
                    disabled={!reviewText || stars === 0}
                    aria-label="Update Your Review"
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.03 }}
                >
                    Update Your Review
                </motion.button>
            </div>
        </div>
    );
}

export default UpdateReviewModal;

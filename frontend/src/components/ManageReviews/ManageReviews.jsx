import "./ManageReviews.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserReviews } from "../../store/reviews";
import OpenModalButton from "../OpenModalButton/OpenModalButton.jsx";
import DeleteReviewModal from "../DeleteReviewModal/DeleteReviewModal.jsx";
import UpdateReviewModal from "../UpdateReviewModal/UpdateReviewModal.jsx";
import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function ManageReviews() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const user = useSelector((state) => state.session.user);
    const userReviews = useSelector((state) => state.reviews.userReviews);

    useEffect(() => {
        dispatch(fetchUserReviews());
    }, [dispatch]);

    if (!user) {
        navigate("/", {
            state: { error: "You must be logged in to manage your reviews" },
            replace: true,
        });
        return null;
    }

    const reviewsArray = Object.values(userReviews);

    return (
        <div className="reviews-page" role="main">
            <div className="reviews-header">
                <h1 tabIndex={0}>Manage Your Reviews</h1>
            </div>
            {reviewsArray.length === 0 ? (
                <div className="no-reviews-message">
                    <Skeleton height={40} count={3} />
                    <p>You haven&apos;t written any reviews yet.</p>
                </div>
            ) : (
                <div className="reviews-list">
                    {reviewsArray.map((review, idx) => {
                        const formattedDate = new Date(
                            review.createdAt
                        ).toLocaleString("en-US", {
                            month: "long",
                            year: "numeric",
                        });

                        return (
                            <motion.div
                                key={review.id}
                                className="review-item"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                tabIndex={0}
                                role="article"
                                aria-label={`Review for ${
                                    review.Spot?.name || "spot"
                                }`}
                            >
                                <div className="review-header">
                                    <strong>
                                        {review.Spot?.name || "Unnamed Spot"}
                                    </strong>
                                    <span>{formattedDate}</span>
                                </div>
                                <div className="review-content">
                                    <p>{review.review}</p>
                                </div>
                                <div className="review-actions">
                                    <OpenModalButton
                                        buttonText="Edit"
                                        modalComponent={
                                            <UpdateReviewModal
                                                reviewId={review.id}
                                                existingReview={review.review}
                                                existingStars={review.stars}
                                                spotId={review.spotId}
                                                currentPage="manage"
                                            />
                                        }
                                        className="edit-button"
                                        aria-label="Edit review"
                                    />
                                    <OpenModalButton
                                        buttonText="Delete"
                                        modalComponent={
                                            <DeleteReviewModal
                                                reviewId={review.id}
                                                spotId={review.spotId}
                                            />
                                        }
                                        className="delete-button"
                                        aria-label="Delete review"
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default ManageReviews;

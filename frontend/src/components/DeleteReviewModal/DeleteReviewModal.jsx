import "./DeleteReviewModal.css";
import { useModal } from "../../context/Modal";
import { useDispatch } from "react-redux";
import { removeReview, fetchReviewsForSpot } from "../../store/reviews";
import { fetchSpotDetails } from "../../store/spots";
import { motion } from "framer-motion";

function DeleteReviewModal({ reviewId, spotId }) {
    const dispatch = useDispatch();
    const { closeModal } = useModal();

    const handleDelete = async () => {
        await dispatch(removeReview(reviewId, spotId));
        await dispatch(fetchReviewsForSpot(spotId));
        await dispatch(fetchSpotDetails(spotId));
        closeModal();
    };

    return (
        <div
            className="modal-container"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-review-title"
        >
            <h2 id="delete-review-title">Delete Review</h2>
            <div className="h4-container">
                Are you sure you want to delete this review?
            </div>
            <div className="action-buttons">
                <motion.button
                    className="yes"
                    onClick={handleDelete}
                    aria-label="Yes, delete"
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.03 }}
                >
                    Yes (Delete Review)
                </motion.button>
                <motion.button
                    className="no"
                    onClick={closeModal}
                    aria-label="No, keep"
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.03 }}
                >
                    No (Keep Review)
                </motion.button>
            </div>
        </div>
    );
}

export default DeleteReviewModal;

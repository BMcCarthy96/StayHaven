import { useModal } from "../../context/Modal";
import { useDispatch } from "react-redux";
import { deleteSpot, fetchSpots } from "../../store/spots";
import "./DeleteSpotModal.css";
import { motion } from "framer-motion";

function DeleteSpotModal({ spot }) {
    const { closeModal } = useModal();
    const dispatch = useDispatch();

    const handleDelete = async () => {
        try {
            await dispatch(deleteSpot(spot.id));
            setTimeout(() => dispatch(fetchSpots()), 200);
            closeModal();
        } catch (error) {
            console.error("Failed to delete spot:", error);
        }
    };

    return (
        <div
            className="delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-spot-title"
        >
            <h1 id="delete-spot-title">Confirm Delete</h1>
            <h4 className="h4-container">
                Are you sure you want to remove this spot?
            </h4>
            <div className="action-buttons">
                <motion.button
                    onClick={handleDelete}
                    className="yes"
                    aria-label="Yes, delete spot"
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.03 }}
                >
                    Yes (Delete Spot)
                </motion.button>
                <motion.button
                    onClick={closeModal}
                    className="no"
                    aria-label="No, keep spot"
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.03 }}
                >
                    No (Keep Spot)
                </motion.button>
            </div>
        </div>
    );
}

export default DeleteSpotModal;

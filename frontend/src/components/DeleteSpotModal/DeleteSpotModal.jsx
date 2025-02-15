import { useDispatch } from "react-redux";
import { deleteSpot } from "../../store/spots";
import { useNavigate } from "react-router-dom";
import './DeleteSpotModal.css';

function DeleteSpotModal({ spotId, closeModal }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleDelete = async () => {
        try {
            await dispatch(deleteSpot(spotId));
            navigate("/");
            closeModal();
        } catch (error) {
            console.error("Failed to delete spot:", error);
        }
    };

    const handleCancel = () => {
        closeModal();
    };

    return (
        <div className="delete-spot-modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to remove this spot?</p>
            <div className="modal-actions">
                <button className="cancel-btn" onClick={handleCancel}>No (Keep Spot)</button>
                <button className="delete-btn" onClick={handleDelete}>Yes (Delete Spot)</button>
            </div>
        </div>
    );
}

export default DeleteSpotModal;

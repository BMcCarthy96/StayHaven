import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchSpots } from "../../store/spots";
import OpenModalButton from "../OpenModalButton/OpenModalButton.jsx";
import DeleteSpotModal from "../DeleteSpotModal/DeleteSpotModal.jsx";
import SpotCard from "../SpotCard/SpotCard.jsx";
import Button from "../ui/Button.jsx";
import "./ManageSpots.css";

function ManageSpotsModal() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const currentUser = useSelector((state) => state.session.user);
    const allSpots = useSelector((state) => state.spots.allSpots);

    useEffect(() => {
        dispatch(fetchSpots());
    }, [dispatch]);

    if (!currentUser) {
        navigate("/", {
            state: { error: "You must be logged in to manage your spots" },
            replace: true,
        });
        return null;
    }

    const userListings = Object.values(allSpots).filter(
        (spot) => spot.ownerId === currentUser.id
    );

    return (
        <div className="manage-spots-page">
            <div className="manage-spots-header">
                <h1>Manage Your Spots</h1>
                <Link
                    to="/spots/new"
                    className="new-listing-button"
                    aria-label="Create a New Spot"
                    tabIndex={0}
                >
                    Create a New Spot
                </Link>
            </div>

            {userListings.length === 0 ? (
                <p className="no-listings-message">
                    You haven&apos;t added any spots yet.
                </p>
            ) : (
                <div className="spot-grid">
                    {userListings.map((listing) => (
                        <SpotCard
                            key={listing.id}
                            spot={listing}
                            footer={
                                <>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() =>
                                            navigate(`/spots/${listing.id}/edit`)
                                        }
                                        aria-label={`Edit ${listing.name}`}
                                    >
                                        Update
                                    </Button>
                                    <OpenModalButton
                                        buttonText="Delete"
                                        modalComponent={
                                            <DeleteSpotModal spot={listing} />
                                        }
                                        className="btn btn-danger btn-sm"
                                        aria-label={`Delete ${listing.name}`}
                                    />
                                </>
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default ManageSpotsModal;

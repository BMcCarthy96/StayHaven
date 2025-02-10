import { fetchSpots } from "../../store/spots";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MdStar } from "react-icons/md";
import "./LandingPage.css";

function LandingPage() {
    const dispatch = useDispatch();
    const spotsList = useSelector((state) => state.spots.allSpots);

    useEffect(() => {
        dispatch(fetchSpots());
    }, [dispatch]);

    return (
        <section className="container">
            {Object.values(spotsList).map((spot) => (
                <Link to={`/spots/${spot.id}`} key={spot.id} className="spot-link">
                    <div className="spot-card" data-tooltip-id={`tooltip-${spot.id}`}>
                        <div className="spot-image">
                            <img src={spot.previewImage} alt={spot.name} />
                        </div>
                        <div className="spot-info">
                            <p className="spot-location">
                                {spot.city}, {spot.state}
                                <span className="spot-rating">
                                    <MdStar /> {spot.avgRating ? spot.avgRating.toFixed(1) : "New"}
                                </span>
                            </p>
                            <p className="spot-price">
                                ${spot.price} <span>night</span>
                            </p>
                        </div>
                    </div>
                </Link>
            ))}
        </section>
    );
}

export default LandingPage;

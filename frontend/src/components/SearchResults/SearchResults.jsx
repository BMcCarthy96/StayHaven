import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { searchSpots } from "../../store/spots";
import {
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
} from "../../store/wishlist";
import SearchBar from "../SearchBar/SearchBar";
import SpotCard from "../SpotCard/SpotCard";
import EmptyState from "../ui/EmptyState";
import { FaSearchLocation } from "react-icons/fa";
import "./SearchResults.css";

function SearchResults() {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const loggedInUser = useSelector((state) => state.session.user);
    const wishlist = useSelector((state) => state.wishlist.spots || []);

    const location = searchParams.get("location") || "";
    const checkIn = searchParams.get("checkIn") || "";
    const checkOut = searchParams.get("checkOut") || "";
    const guests = searchParams.get("guests") || "";

    useEffect(() => {
        if (loggedInUser) dispatch(fetchWishlist());
    }, [dispatch, loggedInUser]);

    useEffect(() => {
        setIsLoading(true);
        dispatch(searchSpots({ location, checkIn, checkOut, guests })).then(
            (spots) => {
                setResults(spots || []);
                setIsLoading(false);
            }
        );
    }, [dispatch, location, checkIn, checkOut, guests]);

    const handleToggleWishlist = (spot) => {
        if (!loggedInUser) {
            toast.info("Log in to save spots to your wishlist.");
            return;
        }
        const isWishlisted = wishlist.some((s) => s.id === spot.id);
        dispatch(isWishlisted ? removeFromWishlist(spot.id) : addToWishlist(spot.id));
    };

    return (
        <div className="search-results-page">
            <div className="search-results-bar">
                <SearchBar initialValues={{ location, checkIn, checkOut, guests }} />
            </div>

            <div className="search-results-body">
                {!isLoading && (
                    <p className="search-results-count">
                        {results.length} {results.length === 1 ? "stay" : "stays"}
                        {location ? ` in "${location}"` : ""}
                    </p>
                )}

                {isLoading ? (
                    <div className="spot-grid">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div className="search-skeleton-card" key={i} />
                        ))}
                    </div>
                ) : results.length === 0 ? (
                    <EmptyState
                        icon={<FaSearchLocation />}
                        title="No stays match your search"
                        message="Try a different location, fewer guests, or different dates."
                    />
                ) : (
                    <div className="spot-grid">
                        {results.map((spot) => (
                            <SpotCard
                                key={spot.id}
                                spot={spot}
                                isWishlisted={wishlist.some((s) => s.id === spot.id)}
                                onToggleWishlist={handleToggleWishlist}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchResults;

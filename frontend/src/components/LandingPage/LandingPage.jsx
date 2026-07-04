import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchSpots } from "../../store/spots";
import {
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
} from "../../store/wishlist";
import SearchBar from "../SearchBar/SearchBar";
import SpotCard from "../SpotCard/SpotCard";
import Slider from "react-slick";
import "./LandingPage.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Fix default marker icon issue with webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function LandingPage() {
    const dispatch = useDispatch();
    const wishlist = useSelector((state) => state.wishlist.spots || []);
    const loggedInUser = useSelector((state) => state.session.user);
    const spotsList = useSelector((state) => state.spots.allSpots);

    useEffect(() => {
        dispatch(fetchSpots());
        if (loggedInUser) {
            dispatch(fetchWishlist());
        }
    }, [dispatch, loggedInUser]);

    const allSpots = Object.values(spotsList);
    const isLoading = allSpots.length === 0;

    const featuredSpots = [...allSpots]
        .filter((spot) => spot.avgRating)
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 6);

    const exploreSpots = allSpots.slice(0, 8);

    const mapCenter =
        featuredSpots.length > 0
            ? [featuredSpots[0].lat, featuredSpots[0].lng]
            : [40.7128, -74.006]; // Default: New York

    const carouselSettings = {
        dots: true,
        infinite: featuredSpots.length > 3,
        speed: 500,
        slidesToShow: Math.min(3, featuredSpots.length || 1),
        slidesToScroll: 1,
        responsive: [
            { breakpoint: 900, settings: { slidesToShow: 2 } },
            { breakpoint: 600, settings: { slidesToShow: 1 } },
        ],
    };

    const handleToggleWishlist = (spot) => {
        if (!loggedInUser) {
            toast.info("Log in to save spots to your wishlist.");
            return;
        }
        const isWishlisted = wishlist.some((s) => s.id === spot.id);
        dispatch(
            isWishlisted ? removeFromWishlist(spot.id) : addToWishlist(spot.id)
        );
    };

    return (
        <div className="landing-root">
            {/* Hero Section */}
            <section className="hero-section" aria-label="Hero Section">
                <img
                    className="hero-bg"
                    src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80"
                    alt="StayHaven Hero"
                />
                <div className="hero-overlay-content">
                    <h1 className="hero-title">Find Your Next Stay</h1>
                    <p className="hero-tagline">
                        Discover unique homes and experiences around the world.
                    </p>
                </div>
                <div className="hero-search-wrapper">
                    <SearchBar />
                </div>
            </section>

            {/* Featured Spots Carousel */}
            <section className="featured-carousel-section">
                <h2>Featured Spots</h2>
                {isLoading ? (
                    <div className="spot-grid">
                        {Array.from({ length: 3 }).map((_, idx) => (
                            <Skeleton key={idx} height={280} borderRadius={16} />
                        ))}
                    </div>
                ) : (
                    <Slider {...carouselSettings}>
                        {featuredSpots.map((spot) => (
                            <div key={spot.id}>
                                <SpotCard
                                    spot={spot}
                                    variant="carousel"
                                    isWishlisted={wishlist.some(
                                        (s) => s.id === spot.id
                                    )}
                                    onToggleWishlist={handleToggleWishlist}
                                />
                            </div>
                        ))}
                    </Slider>
                )}
            </section>

            {/* Interactive Map Preview */}
            <section className="map-preview-section" aria-label="Map preview">
                <h2>Explore Featured Spots on the Map</h2>
                <MapContainer
                    center={mapCenter}
                    zoom={2}
                    style={{
                        height: "320px",
                        width: "100%",
                        borderRadius: "16px",
                    }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {featuredSpots.map((spot) => (
                        <Marker key={spot.id} position={[spot.lat, spot.lng]}>
                            <Popup>
                                <strong>{spot.name}</strong>
                                <br />
                                {spot.city}, {spot.state}
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </section>

            {/* Explore Section */}
            <section className="explore-section" aria-label="Explore stays">
                <div className="explore-header">
                    <h2>Explore Stays</h2>
                    <Link to="/search" className="explore-all-link">
                        Explore all stays &rarr;
                    </Link>
                </div>
                {isLoading ? (
                    <div className="spot-grid">
                        {Array.from({ length: 8 }).map((_, idx) => (
                            <Skeleton key={idx} height={280} borderRadius={16} />
                        ))}
                    </div>
                ) : (
                    <div className="spot-grid">
                        {exploreSpots.map((spot) => (
                            <SpotCard
                                key={spot.id}
                                spot={spot}
                                isWishlisted={wishlist.some(
                                    (s) => s.id === spot.id
                                )}
                                onToggleWishlist={handleToggleWishlist}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default LandingPage;

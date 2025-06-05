import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchSpots } from "../../store/spots";
import {
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
} from "../../store/wishlist";
import { Link } from "react-router-dom";
import { MdStar } from "react-icons/md";
import { FaCrown, FaFire, FaUser, FaHeart } from "react-icons/fa";
import Slider from "react-slick";
import CountUp from "react-countup";
import gravatarUrl from "gravatar-url";
import "./LandingPage.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { motion } from "framer-motion";
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

const TESTIMONIALS = [
    {
        name: "Alice",
        email: "alice@example.com",
        review: "StayHaven made my vacation unforgettable! The booking process was seamless.",
        stars: 5,
    },
    {
        name: "Bob",
        email: "bob@example.com",
        review: "Amazing hosts and beautiful homes. Highly recommend!",
        stars: 5,
    },
    {
        name: "Charlie",
        email: "charlie@example.com",
        review: "The search and booking experience was top-notch.",
        stars: 4,
    },
];

function LandingPage() {
    const dispatch = useDispatch();
    const wishlist = useSelector((state) => state.wishlist.spots || []);
    const loggedInUser = useSelector((state) => state.session.user);
    const spotsList = useSelector((state) => state.spots.allSpots);
    const [search, setSearch] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [date, setDate] = useState("");
    const [guests, setGuests] = useState(1);

    useEffect(() => {
        dispatch(fetchSpots());
        if (loggedInUser) {
            dispatch(fetchWishlist());
        }
    }, [dispatch, loggedInUser]);

    // Featured spots: top 5 by avgRating
    const featuredSpots = Object.values(spotsList)
        .filter((spot) => spot.avgRating)
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 5);

    // Stats (fake numbers for demo)
    const stats = {
        spots: Object.values(spotsList).length,
        users: 1200,
        bookings: 3400,
    };

    // Carousel settings
    const carouselSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        responsive: [
            { breakpoint: 900, settings: { slidesToShow: 2 } },
            { breakpoint: 600, settings: { slidesToShow: 1 } },
        ],
    };

    const testimonialSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
    };

    // Search filter
    const filteredSpots = Object.values(spotsList).filter(
        (spot) =>
            spot.city.toLowerCase().includes(search.toLowerCase()) ||
            spot.state.toLowerCase().includes(search.toLowerCase()) ||
            spot.country.toLowerCase().includes(search.toLowerCase())
    );

    // Center the map on the first featured spot or a default location
    const mapCenter =
        featuredSpots.length > 0
            ? [featuredSpots[0].lat, featuredSpots[0].lng]
            : [40.7128, -74.006]; // Default: New York

    const isLoading = Object.values(spotsList).length === 0;

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
                    <button
                        className="hero-cta"
                        onClick={() =>
                            window.scrollTo({ top: 600, behavior: "smooth" })
                        }
                    >
                        Explore Stays
                    </button>
                </div>
                {/* Animated Search Bar */}
                <div
                    className={`search-bar${showDropdown ? " expanded" : ""}`}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setShowDropdown(false)}
                    tabIndex={0}
                    role="search"
                    aria-label="Search stays"
                >
                    <input
                        type="text"
                        placeholder="Search by city, state, or country"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                        aria-label="Search location"
                    />
                    <div
                        className={`search-dropdown${
                            showDropdown ? " show" : ""
                        }`}
                        aria-label="Search filters"
                    >
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="search-date"
                            aria-label="Select date"
                        />
                        <input
                            type="number"
                            min={1}
                            value={guests}
                            onChange={(e) => setGuests(Number(e.target.value))}
                            className="search-guests"
                            placeholder="Guests"
                            aria-label="Number of guests"
                        />
                    </div>
                    <button className="search-btn" aria-label="Search stays">
                        Search
                    </button>
                </div>
            </section>

            {/* Animated Stats */}
            <section className="stats-section">
                <div className="stat-card">
                    <FaFire className="stat-icon" />
                    <div>
                        <CountUp end={stats.spots} duration={2} />
                        <div className="stat-label">Spots</div>
                    </div>
                </div>
                <div className="stat-card">
                    <FaUser className="stat-icon" />
                    <div>
                        <CountUp end={stats.users} duration={2} />
                        <div className="stat-label">Users</div>
                    </div>
                </div>
                <div className="stat-card">
                    <FaCrown className="stat-icon" />
                    <div>
                        <CountUp end={stats.bookings} duration={2} />
                        <div className="stat-label">Bookings</div>
                    </div>
                </div>
            </section>

            {/* Featured Spots Carousel */}
            <section className="featured-carousel-section">
                <h2>Featured Spots</h2>
                <Slider {...carouselSettings}>
                    {featuredSpots.map((spot) => (
                        <div key={spot.id} className="featured-spot-card">
                            <Link to={`/spots/${spot.id}`}>
                                <div className="featured-spot-image">
                                    <img
                                        src={spot.previewImage}
                                        alt={spot.name}
                                    />
                                    {spot.avgRating >= 4.8 && (
                                        <span className="badge superhost">
                                            Superhost
                                        </span>
                                    )}
                                    {spot.avgRating >= 4.5 &&
                                        spot.avgRating < 4.8 && (
                                            <span className="badge trending">
                                                Trending
                                            </span>
                                        )}
                                    {spot.numReviews < 3 && (
                                        <span className="badge new">New</span>
                                    )}
                                </div>
                                <div className="featured-spot-info">
                                    <div className="featured-spot-location">
                                        {spot.city}, {spot.state}
                                    </div>
                                    <div className="featured-spot-rating">
                                        <MdStar />{" "}
                                        {spot.avgRating
                                            ? spot.avgRating.toFixed(1)
                                            : "New"}
                                    </div>
                                    <div className="featured-spot-price">
                                        $
                                        {spot.price
                                            ? Number(spot.price).toFixed(2)
                                            : "N/A"}{" "}
                                        <span>night</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </Slider>
            </section>

            {/* Interactive Map Preview */}
            <section className="map-preview-section">
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

            {/* Spot Cards Grid */}
            <section className="container" aria-label="All spots">
                {isLoading
                    ? Array.from({ length: 6 }).map((_, idx) => (
                          <div className="spot-card" key={idx}>
                              <Skeleton height={200} />
                              <div style={{ padding: 10 }}>
                                  <Skeleton width={120} />
                                  <Skeleton width={80} />
                                  <Skeleton width={60} />
                              </div>
                          </div>
                      ))
                    : filteredSpots.map((spot, idx) => {
                          const isWishlisted = wishlist.some(
                              (s) => s.id === spot.id
                          );

                          const handleWishlist = (e) => {
                              if (!loggedInUser) {
                                  e.preventDefault();
                                  return alert(
                                      "Please log in to use wishlist!"
                                  );
                              }
                              e.preventDefault();
                              if (isWishlisted) {
                                  dispatch(removeFromWishlist(spot.id));
                              } else {
                                  dispatch(addToWishlist(spot.id));
                              }
                          };

                          return (
                              <Link
                                  to={`/spots/${spot.id}`}
                                  key={spot.id}
                                  className="spot-link"
                                  tabIndex={0}
                              >
                                  <motion.div
                                      className="spot-card"
                                      data-tooltip-id={`tooltip-${spot.id}`}
                                      initial={{ opacity: 0, y: 30 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{
                                          duration: 0.5,
                                          delay: idx * 0.07,
                                      }}
                                      whileHover={{
                                          scale: 1.03,
                                          boxShadow:
                                              "0 8px 32px rgba(0,0,0,0.13)",
                                      }}
                                  >
                                      <div className="spot-image">
                                          <img
                                              src={spot.previewImage}
                                              alt={spot.name}
                                          />
                                      </div>
                                      <div className="spot-info">
                                          <p className="spot-location">
                                              {spot.city}, {spot.state}
                                              <span className="spot-rating">
                                                  <MdStar />{" "}
                                                  {Number(spot.avgRating) > 0
                                                      ? Number(
                                                            spot.avgRating
                                                        ).toFixed(1)
                                                      : "New"}
                                              </span>
                                          </p>
                                          <p className="spot-price">
                                              $
                                              {!isNaN(parseFloat(spot.price))
                                                  ? parseFloat(
                                                        spot.price
                                                    ).toFixed(2)
                                                  : "N/A"}{" "}
                                              <span>night</span>
                                          </p>
                                      </div>
                                      <button
                                          className={`favorite-btn${
                                              isWishlisted ? " liked" : ""
                                          }`}
                                          onClick={handleWishlist}
                                          aria-label={
                                              isWishlisted
                                                  ? "Remove from wishlist"
                                                  : "Add to wishlist"
                                          }
                                          tabIndex={0}
                                          style={{
                                              position: "absolute",
                                              top: 12,
                                              right: 12,
                                              background: "none",
                                              border: "none",
                                              zIndex: 2,
                                          }}
                                      >
                                          <FaHeart
                                              color={
                                                  isWishlisted
                                                      ? "#ff6f61"
                                                      : "#ccc"
                                              }
                                              size={22}
                                          />
                                      </button>
                                  </motion.div>
                              </Link>
                          );
                      })}
            </section>

            {/* Testimonials Carousel */}
            <section className="testimonials-section">
                <h2>What Our Guests Say</h2>
                <Slider {...testimonialSettings}>
                    {TESTIMONIALS.map((t, idx) => (
                        <div key={idx} className="testimonial-card">
                            <div className="testimonial-avatar">
                                <img
                                    src={gravatarUrl(t.email, {
                                        size: 60,
                                        default: "retro",
                                    })}
                                    alt={t.name}
                                />
                            </div>
                            <div className="testimonial-content">
                                <div className="testimonial-name">{t.name}</div>
                                <div className="testimonial-stars">
                                    {[...Array(5)].map((_, i) => (
                                        <MdStar
                                            key={i}
                                            style={{
                                                color:
                                                    i < t.stars
                                                        ? "#FFB400"
                                                        : "#e4e5e9",
                                            }}
                                        />
                                    ))}
                                </div>
                                <div className="testimonial-text">
                                    {t.review}
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>
            </section>
        </div>
    );
}

export default LandingPage;

import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchSpotDetails, fetchSpots } from "../../store/spots";
import "./SpotDetails.css";
import { MdOutlineStar } from "react-icons/md";
import { GoDotFill } from "react-icons/go";
import {
    FaHeart,
    FaShareAlt,
    FaWifi,
    FaBed,
    FaBath,
    FaSmokingBan,
} from "react-icons/fa";
import { fetchReviewsForSpot } from "../../store/reviews";
import OpenModalButton from "../OpenModalButton/OpenModalButton.jsx";
import CreateReviewModal from "../CreateReviewModal/CreateReviewModal.jsx";
import DeleteReviewModal from "../DeleteReviewModal/DeleteReviewModal.jsx";
import UpdateReviewModal from "../UpdateReviewModal/UpdateReviewModal.jsx";
import HostProfileModal from "../HostProfileModal/HostProfileModal.jsx";
import Slider from "react-slick";
import gravatarUrl from "gravatar-url";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { motion, AnimatePresence } from "framer-motion";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { fetchSpotBookings } from "../../store/bookings";
import {
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
} from "../../store/wishlist";
import { Tooltip } from "react-tooltip";
import {
    FacebookShareButton,
    TwitterShareButton,
    EmailShareButton,
} from "react-share";

function SpotDetails() {
    const { spotId } = useParams();
    const dispatch = useDispatch();

    const spotData = useSelector((state) => state.spots.spotDetails);
    const reviewsObj = useSelector(
        (state) => state.reviews.reviewsBySpot[spotId] || {}
    );
    const loggedInUser = useSelector((state) => state.session.user);

    const reviews = useMemo(() => Object.values(reviewsObj), [reviewsObj]);

    const isOwner = loggedInUser && spotData.Owner?.id === loggedInUser.id;
    const hasReviewed = reviews.some(
        (review) => review.User?.id === loggedInUser?.id
    );

    // Wishlist logic
    const wishlist = useSelector((state) => state.wishlist.spots || []);
    const isWishlisted = wishlist.some((s) => s.id === spotData.id);

    useEffect(() => {
        dispatch(fetchSpots());
        if (loggedInUser) {
            dispatch(fetchWishlist());
        }
    }, [dispatch, loggedInUser]);

    const handleWishlist = (e) => {
        if (!loggedInUser) {
            e.preventDefault();
            alert("Please log in to use wishlist!");
            return;
        }
        e.preventDefault();
        if (isWishlisted) {
            dispatch(removeFromWishlist(spotData.id));
        } else {
            dispatch(addToWishlist(spotData.id));
        }
    };

    // Availability Calendar state
    const [bookings, setBookings] = useState([]);
    const [calendarRange, setCalendarRange] = useState([
        { startDate: new Date(), endDate: new Date(), key: "selection" },
    ]);

    useEffect(() => {
        dispatch(fetchSpotDetails(spotId));
        dispatch(fetchReviewsForSpot(spotId));
        dispatch(fetchSpotBookings(spotId)).then(setBookings);
    }, [dispatch, spotId]);

    // Get array of all booked date ranges
    const bookedRanges = bookings.map((b) => ({
        start: new Date(b.startDate),
        end: new Date(b.endDate),
    }));

    // Helper to check if a date is booked
    const isDateBooked = (date) =>
        bookedRanges.some(({ start, end }) => date >= start && date <= end);

    // Google Maps
    const { isLoaded: mapLoaded } = useJsApiLoader({
        googleMapsApiKey: "AIzaSyCHx89b489Ou8emoXAOgYMSfAkf8UJ1Wng",
    });

    // Carousel images
    const images = spotData.SpotImages?.map((img) => img.url) || [];
    const galleryImages =
        spotData.SpotImages?.filter((img) => !img.preview).map(
            (img) => img.url
        ) || [];

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        adaptiveHeight: true,
    };

    // Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(0);

    // Star breakdown for reviews
    const starCounts = [5, 4, 3, 2, 1].map(
        (star) => reviews.filter((r) => r.stars === star).length
    );
    const [starFilter, setStarFilter] = useState(null);

    // Example nearby attractions (static for demo)
    const nearbyAttractions = [
        {
            name: "Central Park",
            lat: spotData.lat ? Number(spotData.lat) + 0.01 : 40.785091,
            lng: spotData.lng ? Number(spotData.lng) + 0.01 : -73.968285,
            type: "park",
        },
        {
            name: "Famous Restaurant",
            lat: spotData.lat ? Number(spotData.lat) - 0.008 : 40.761432,
            lng: spotData.lng ? Number(spotData.lng) - 0.008 : -73.977622,
            type: "restaurant",
        },
    ];

    const allSpots = useSelector((state) => state.spots.allSpots || {});

    // Memoize relatedSpots to avoid unnecessary rerenders
    const relatedSpots = useMemo(
        () =>
            Object.values(allSpots).filter(
                (s) => s.id !== spotData.id && s.city === spotData.city
            ),
        [allSpots, spotData.id, spotData.city]
    );

    // Booking form animation and validation
    const [showBooking, setShowBooking] = useState(false);
    const [bookingError, setBookingError] = useState("");

    if (!spotData || Object.keys(spotData).length === 0) {
        // Progressive loading: skeletons for all main sections
        return (
            <div style={{ padding: 32 }}>
                <Skeleton height={340} />
                <Skeleton count={5} />
                <div style={{ marginTop: 32 }}>
                    <Skeleton height={40} width={200} />
                    <Skeleton height={120} />
                </div>
            </div>
        );
    }

    const center = {
        lat: Number(spotData.lat) || 0,
        lng: Number(spotData.lng) || 0,
    };

    // Share button handler
    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
    };

    const handleBookingOpen = () => setShowBooking((prev) => !prev);

    const handleReserve = () => {
        // Example validation: check if dates are valid
        if (
            isDateBooked(calendarRange[0].startDate) ||
            isDateBooked(calendarRange[0].endDate)
        ) {
            setBookingError("Selected dates are already booked.");
            return;
        }
        if (calendarRange[0].endDate <= calendarRange[0].startDate) {
            setBookingError("End date must be after start date.");
            return;
        }
        setBookingError("");
        alert("Booking feature coming soon!");
    };

    return (
        <div className="spot-wrapper" role="main">
            {/* Wishlist and Share Buttons */}
            <motion.button
                className={`favorite-btn${isWishlisted ? " liked" : ""}`}
                onClick={handleWishlist}
                aria-label={
                    isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
                tabIndex={0}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
            >
                <FaHeart color={isWishlisted ? "#ff6f61" : "#ccc"} size={28} />
            </motion.button>
            <motion.button
                className="share-btn"
                onClick={handleShare}
                aria-label="Share this spot"
                tabIndex={0}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
            >
                <FaShareAlt size={22} />
            </motion.button>
            {/* Share Options */}
            <div style={{ display: "flex", gap: 0, margin: "0px" }}>
                <FacebookShareButton
                    url={window.location.href}
                    aria-label="Share on Facebook"
                >
                    <span role="img" aria-label="Facebook">
                        📘
                    </span>
                </FacebookShareButton>
                <TwitterShareButton
                    url={window.location.href}
                    aria-label="Share on Twitter"
                >
                    <span role="img" aria-label="Twitter">
                        🐦
                    </span>
                </TwitterShareButton>
                <EmailShareButton
                    url={window.location.href}
                    aria-label="Share via Email"
                >
                    <span role="img" aria-label="Email">
                        ✉️
                    </span>
                </EmailShareButton>
            </div>

            {/* Hero Image & Carousel */}
            <div
                className="hero-image-container"
                aria-label="Spot photo carousel"
                tabIndex={0}
                role="region"
            >
                <Slider {...sliderSettings}>
                    {images.length === 0 ? (
                        <Skeleton height={340} />
                    ) : (
                        images.map((img, idx) => (
                            <div key={idx}>
                                <img
                                    className="hero-image"
                                    src={img}
                                    alt={`Spot image ${idx + 1}`}
                                    tabIndex={0}
                                    loading="lazy"
                                    onClick={() => {
                                        setPhotoIndex(idx);
                                        setLightboxOpen(true);
                                    }}
                                    style={{ cursor: "zoom-in" }}
                                />
                            </div>
                        ))
                    )}
                </Slider>
                <div className="hero-overlay">
                    <h1 className="hero-title">{spotData.name}</h1>
                    <div className="hero-location">
                        {spotData.city}, {spotData.state}, {spotData.country}
                    </div>
                </div>
            </div>
            {/* Gallery Section */}
            {galleryImages.length > 0 && (
                <div className="gallery-section" aria-label="Gallery images">
                    {galleryImages.map((img, idx) => (
                        <div className="gallery-image" key={idx}>
                            <img
                                src={img}
                                alt={`Gallery image ${idx + 1}`}
                                loading="lazy"
                                tabIndex={0}
                                style={{ cursor: "zoom-in" }}
                                onClick={() => {
                                    setPhotoIndex(images.length + idx);
                                    setLightboxOpen(true);
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}
            {lightboxOpen && (
                <Lightbox
                    open={lightboxOpen}
                    close={() => setLightboxOpen(false)}
                    slides={[...images, ...galleryImages].map((src) => ({
                        src,
                    }))}
                    index={photoIndex}
                    on={{ view: ({ index }) => setPhotoIndex(index) }}
                />
            )}

            {/* Availability Calendar */}
            <section
                className="availability-calendar"
                style={{ margin: "32px" }}
            >
                <h3>Availability</h3>
                <DateRange
                    ranges={calendarRange}
                    onChange={(item) => setCalendarRange([item.selection])}
                    minDate={new Date()}
                    disabledDates={[].concat(
                        ...bookedRanges.map(({ start, end }) => {
                            const dates = [];
                            let d = new Date(start);
                            while (d <= end) {
                                dates.push(new Date(d));
                                d.setDate(d.getDate() + 1);
                            }
                            return dates;
                        })
                    )}
                    aria-label="Availability calendar"
                />
                {isDateBooked(calendarRange[0].startDate) && (
                    <div
                        className="calendar-warning"
                        style={{ color: "red", marginTop: 8 }}
                        role="alert"
                    >
                        The selected start date is already booked!
                    </div>
                )}
            </section>

            <section
                className="details-booking-section"
                aria-label="Spot details and booking"
            >
                <motion.div
                    className="spot-info-card"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="host-row">
                        <OpenModalButton
                            buttonText={
                                <span className="host-badge">SUPERHOST</span>
                            }
                            modalComponent={
                                <HostProfileModal
                                    host={spotData.Owner}
                                    bio={spotData.Owner?.bio}
                                    badges={spotData.Owner?.badges}
                                    email={spotData.Owner?.email}
                                    joinDate={spotData.Owner?.createdAt}
                                />
                            }
                            aria-label="View host profile"
                        />
                        <span className="spot-host">
                            Hosted by {spotData.Owner?.firstName}{" "}
                            {spotData.Owner?.lastName}
                        </span>
                    </div>
                    <p className="spot-description">{spotData.description}</p>
                    <div className="amenities-row">
                        <span
                            className="amenity"
                            tabIndex={0}
                            aria-label="2 Beds"
                            data-tooltip-id="amenity-beds"
                            data-tooltip-content="2 Beds"
                        >
                            <FaBed /> 2 Beds
                        </span>
                        <span
                            className="amenity"
                            tabIndex={0}
                            aria-label="1 Bath"
                            data-tooltip-id="amenity-bath"
                            data-tooltip-content="1 Bath"
                        >
                            <FaBath /> 1 Bath
                        </span>
                        <span
                            className="amenity"
                            tabIndex={0}
                            aria-label="Wifi"
                            data-tooltip-id="amenity-wifi"
                            data-tooltip-content="Wifi"
                        >
                            <FaWifi /> Wifi
                        </span>
                        <span
                            className="amenity"
                            tabIndex={0}
                            aria-label="No Smoking"
                            data-tooltip-id="amenity-nosmoking"
                            data-tooltip-content="No Smoking"
                        >
                            <FaSmokingBan /> No Smoking
                        </span>
                        {/* Add more amenities as needed */}
                        <Tooltip id="amenity-beds" />
                        <Tooltip id="amenity-bath" />
                        <Tooltip id="amenity-wifi" />
                        <Tooltip id="amenity-nosmoking" />
                    </div>
                </motion.div>

                {/* Booking Card with animation and validation */}
                <motion.div
                    className="booking-card"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="booking-header">
                        <span className="booking-price">
                            $
                            {spotData.price !== undefined &&
                            !isNaN(parseFloat(spotData.price))
                                ? parseFloat(spotData.price).toFixed(2)
                                : "N/A"}{" "}
                            <span className="per-night">night</span>
                        </span>
                        <span className="booking-rating">
                            <MdOutlineStar />{" "}
                            {spotData.avgStarRating
                                ? spotData.avgStarRating.toFixed(1)
                                : "New"}
                        </span>
                        {spotData.numReviews > 0 && <GoDotFill size={8} />}
                        {spotData.numReviews > 0 && (
                            <span className="review-count">
                                {spotData.numReviews}{" "}
                                {spotData.numReviews === 1
                                    ? "Review"
                                    : "Reviews"}
                            </span>
                        )}
                    </div>
                    <motion.button
                        className="booking-toggle-btn"
                        onClick={handleBookingOpen}
                        aria-label={
                            showBooking
                                ? "Hide booking form"
                                : "Show booking form"
                        }
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ scale: 1.03 }}
                        style={{
                            marginBottom: 12,
                            background: "#eee",
                            color: "#444",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 14px",
                            cursor: "pointer",
                        }}
                    >
                        {showBooking ? "Hide Booking" : "Book Now"}
                    </motion.button>
                    <AnimatePresence>
                        {showBooking && (
                            <motion.div
                                key="booking-form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="price-breakdown">
                                    <div>
                                        <span>Subtotal:</span>
                                        <span>
                                            $
                                            {(
                                                ((calendarRange[0].endDate -
                                                    calendarRange[0]
                                                        .startDate) /
                                                    (1000 * 60 * 60 * 24)) *
                                                spotData.price
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                    <div>
                                        <span>Cleaning Fee:</span>
                                        <span>$50.00</span>
                                    </div>
                                    <div>
                                        <span>Total:</span>
                                        <span>
                                            $
                                            {(
                                                ((calendarRange[0].endDate -
                                                    calendarRange[0]
                                                        .startDate) /
                                                    (1000 * 60 * 60 * 24)) *
                                                    spotData.price +
                                                50
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                {bookingError && (
                                    <div
                                        style={{
                                            color: "red",
                                            marginBottom: 8,
                                            fontWeight: 500,
                                        }}
                                        role="alert"
                                    >
                                        {bookingError}
                                    </div>
                                )}
                                <motion.button
                                    className="booking-button"
                                    onClick={handleReserve}
                                    aria-label="Reserve this spot"
                                    tabIndex={0}
                                    whileTap={{ scale: 0.97 }}
                                    whileHover={{ scale: 1.03 }}
                                >
                                    Reserve
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </section>

            {mapLoaded && (
                <section
                    style={{ margin: "32px" }}
                    aria-label="Map of spot and attractions"
                >
                    <GoogleMap
                        mapContainerStyle={{
                            width: "100%",
                            height: "300px",
                            borderRadius: "12px",
                        }}
                        center={center}
                        zoom={14}
                    >
                        <Marker position={center} />
                        {nearbyAttractions.map((place, idx) => (
                            <Marker
                                key={idx}
                                position={{ lat: place.lat, lng: place.lng }}
                                label={
                                    place.type === "restaurant" ? "🍽️" : "🌳"
                                }
                            />
                        ))}
                    </GoogleMap>
                </section>
            )}

            <hr className="section-divider" />

            {/* Animated Reviews: Star Breakdown & Filter */}
            <section className="reviews-section" aria-label="Spot reviews">
                <div className="review-header">
                    <h3>
                        <MdOutlineStar />{" "}
                        {spotData.avgStarRating
                            ? spotData.avgStarRating.toFixed(1)
                            : "New"}
                    </h3>
                    {spotData.numReviews > 0 && (
                        <span className="go-dot-fill" />
                    )}
                    {spotData.numReviews > 0 && (
                        <h3>
                            {spotData.numReviews}{" "}
                            {spotData.numReviews === 1 ? "Review" : "Reviews"}
                        </h3>
                    )}
                </div>
                {/* Star breakdown bar */}
                <div
                    className="star-breakdown-bar"
                    style={{ margin: "16px 0" }}
                >
                    {[5, 4, 3, 2, 1].map((star, i) => (
                        <motion.button
                            key={star}
                            className={`star-filter-btn${
                                starFilter === star ? " active" : ""
                            }`}
                            aria-label={`Filter by ${star} star reviews`}
                            onClick={() =>
                                setStarFilter(starFilter === star ? null : star)
                            }
                            whileTap={{ scale: 0.97 }}
                            whileHover={{ scale: 1.03 }}
                        >
                            {star}{" "}
                            <MdOutlineStar style={{ color: "#FFB400" }} /> (
                            {starCounts[i]})
                        </motion.button>
                    ))}
                </div>
                <div className="post-review-div">
                    {loggedInUser && !isOwner && !hasReviewed && (
                        <OpenModalButton
                            buttonText="Post Your Review"
                            modalComponent={
                                <CreateReviewModal spotId={spotId} />
                            }
                            className="post-review-button"
                            aria-label="Post your review"
                        />
                    )}
                </div>
                {/* Reviews List */}
                {reviews && reviews.length > 0
                    ? reviews
                          .filter((r) => !starFilter || r.stars === starFilter)
                          .sort(
                              (a, b) =>
                                  new Date(b.createdAt) - new Date(a.createdAt)
                          )
                          .map((review, idx) => {
                              const reviewDate = new Date(review.createdAt);
                              const formattedDate = reviewDate.toLocaleString(
                                  "en-US",
                                  { month: "long", year: "numeric" }
                              );
                              const isReviewAuthor =
                                  loggedInUser &&
                                  review.User?.id === loggedInUser.id;

                              // Gravatar avatar or fallback
                              const avatarUrl = review.User?.email
                                  ? gravatarUrl(review.User.email, {
                                        size: 44,
                                        default: "retro",
                                    })
                                  : null;

                              return (
                                  <motion.div
                                      key={review.id}
                                      className="review-card"
                                      initial={{ opacity: 0, y: 30 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{
                                          duration: 0.5,
                                          delay: idx * 0.1,
                                      }}
                                      tabIndex={0}
                                      role="article"
                                      aria-label={`Review by ${
                                          review.User?.firstName || "user"
                                      }`}
                                  >
                                      <div className="review-header">
                                          <div className="review-avatar">
                                              {avatarUrl ? (
                                                  <img
                                                      src={avatarUrl}
                                                      alt="avatar"
                                                      style={{
                                                          width: "100%",
                                                          borderRadius: "50%",
                                                      }}
                                                      loading="lazy"
                                                  />
                                              ) : review.User?.firstName ? (
                                                  review.User.firstName[0].toUpperCase()
                                              ) : (
                                                  <MdOutlineStar />
                                              )}
                                          </div>
                                          <div style={{ flex: 1 }}>
                                              <div className="review-name-date">
                                                  <strong>
                                                      {review.User?.firstName}
                                                  </strong>
                                                  <span className="review-date">
                                                      {formattedDate}
                                                  </span>
                                              </div>
                                              <div
                                                  className="review-stars"
                                                  aria-label={`Rated ${review.stars} stars`}
                                              >
                                                  {[...Array(5)].map((_, i) => (
                                                      <MdOutlineStar
                                                          key={i}
                                                          style={{
                                                              color:
                                                                  i <
                                                                  review.stars
                                                                      ? "#FFB400"
                                                                      : "#e4e5e9",
                                                          }}
                                                      />
                                                  ))}
                                              </div>
                                          </div>
                                      </div>
                                      <div className="review-body">
                                          <p>{review.review}</p>
                                      </div>
                                      {isReviewAuthor && (
                                          <div className="update-delete-div">
                                              <OpenModalButton
                                                  buttonText="Update"
                                                  modalComponent={
                                                      <UpdateReviewModal
                                                          reviewId={review.id}
                                                          initialReview={
                                                              review.review
                                                          }
                                                          initialRating={
                                                              review.stars
                                                          }
                                                          spotId={review.spotId}
                                                          pageType="spot"
                                                      />
                                                  }
                                                  className="update-modal"
                                                  aria-label="Update review"
                                              />
                                              <OpenModalButton
                                                  buttonText="Delete"
                                                  modalComponent={
                                                      <DeleteReviewModal
                                                          reviewId={review.id}
                                                          spotId={spotId}
                                                      />
                                                  }
                                                  className="delete-modal"
                                                  aria-label="Delete review"
                                              />
                                          </div>
                                      )}
                                  </motion.div>
                              );
                          })
                    : !isOwner && <p>Be the first to post a review!</p>}
            </section>

            {/* Related Spots Carousel */}
            {relatedSpots.length > 0 && (
                <section
                    className="related-spots-section"
                    aria-label="Related spots"
                >
                    <h3>Related Spots</h3>
                    <Slider
                        dots
                        infinite
                        speed={500}
                        slidesToShow={3}
                        slidesToScroll={1}
                        responsive={[
                            { breakpoint: 900, settings: { slidesToShow: 2 } },
                            { breakpoint: 600, settings: { slidesToShow: 1 } },
                        ]}
                    >
                        {relatedSpots.map((spot) => (
                            <div key={spot.id} className="related-spot-card">
                                <img
                                    src={spot.previewImage}
                                    alt={spot.name}
                                    loading="lazy"
                                    style={{
                                        width: "100%",
                                        height: 120,
                                        objectFit: "cover",
                                        borderRadius: 8,
                                    }}
                                />
                                <div>
                                    <strong>{spot.name}</strong>
                                    <div>
                                        {spot.city}, {spot.state}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </section>
            )}
        </div>
    );
}

export default SpotDetails;

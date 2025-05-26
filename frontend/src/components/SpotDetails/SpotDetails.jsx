import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchSpotDetails } from "../../store/spots";
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
import { motion } from "framer-motion";

function SpotDetails() {
    const { spotId } = useParams();
    const dispatch = useDispatch();

    const spotData = useSelector((state) => state.spots.spotDetails);
    const reviews = useSelector(
        (state) => state.reviews.reviewsBySpot[spotId] || {}
    );
    const loggedInUser = useSelector((state) => state.session.user);

    const isOwner = loggedInUser && spotData.Owner?.id === loggedInUser.id;
    const hasReviewed = Object.values(reviews).some(
        (review) => review.User?.id === loggedInUser?.id
    );

    const [liked, setLiked] = useState(false);

    useEffect(() => {
        dispatch(fetchSpotDetails(spotId));
        dispatch(fetchReviewsForSpot(spotId));
    }, [dispatch, spotId]);

    // Google Maps
    const { isLoaded: mapLoaded } = useJsApiLoader({
        googleMapsApiKey: "AIzaSyCHx89b489Ou8emoXAOgYMSfAkf8UJ1Wng",
    });

    // Carousel images
    const images = spotData.SpotImages?.map((img) => img.url) || [];

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        adaptiveHeight: true,
    };

    if (!spotData || Object.keys(spotData).length === 0) {
        return (
            <div style={{ padding: 32 }}>
                <Skeleton height={340} />
                <Skeleton count={5} />
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

    return (
        <div className="spot-wrapper">
            <button
                className={`favorite-btn${liked ? " liked" : ""}`}
                onClick={() => setLiked(!liked)}
                aria-label="Favorite"
            >
                <FaHeart color={liked ? "#ff6f61" : "#ccc"} size={28} />
            </button>
            <button
                className="share-btn"
                onClick={handleShare}
                aria-label="Share"
            >
                <FaShareAlt size={22} />
            </button>
            <div className="hero-image-container">
                <Slider {...sliderSettings}>
                    {images.map((img, idx) => (
                        <div key={idx}>
                            <img
                                className="hero-image"
                                src={img}
                                alt={`Spot image ${idx + 1}`}
                            />
                        </div>
                    ))}
                </Slider>
                <div className="hero-overlay">
                    <h1 className="hero-title">{spotData.name}</h1>
                    <div className="hero-location">
                        {spotData.city}, {spotData.state}, {spotData.country}
                    </div>
                </div>
            </div>

            <div className="details-booking-section">
                <div className="spot-info-card">
                    <div className="host-row">
                        <OpenModalButton
                            buttonText={
                                <span className="host-badge">SUPERHOST</span>
                            }
                            modalComponent={
                                <HostProfileModal host={spotData.Owner} />
                            }
                        />
                        <span className="spot-host">
                            Hosted by {spotData.Owner?.firstName}{" "}
                            {spotData.Owner?.lastName}
                        </span>
                    </div>
                    <p className="spot-description">{spotData.description}</p>
                    <div className="amenities-row">
                        <span className="amenity">
                            <FaBed /> 2 Beds
                        </span>
                        <span className="amenity">
                            <FaBath /> 1 Bath
                        </span>
                        <span className="amenity">
                            <FaWifi /> Wifi
                        </span>
                        <span className="amenity">
                            <FaSmokingBan /> No Smoking
                        </span>
                        {/* Add more amenities as needed */}
                    </div>
                </div>

                <div className="booking-card">
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
                    <button
                        className="booking-button"
                        onClick={() => alert("Feature coming soon")}
                    >
                        Reserve
                    </button>
                </div>
            </div>

            {mapLoaded && (
                <div style={{ margin: "32px" }}>
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
                    </GoogleMap>
                </div>
            )}

            <hr className="section-divider" />

            <div className="reviews-section">
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

                <div className="post-review-div">
                    {loggedInUser && !isOwner && !hasReviewed && (
                        <OpenModalButton
                            buttonText="Post Your Review"
                            modalComponent={
                                <CreateReviewModal spotId={spotId} />
                            }
                            className="post-review-button"
                        />
                    )}
                </div>

                {reviews && Object.keys(reviews).length > 0
                    ? Object.values(reviews)
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
                                              <div className="review-stars">
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
                                              />
                                          </div>
                                      )}
                                  </motion.div>
                              );
                          })
                    : !isOwner && <p>Be the first to post a review!</p>}
            </div>
        </div>
    );
}

export default SpotDetails;

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSpotDetails } from '../../store/spots';
import './SpotDetails.css';
import { MdOutlineStar } from "react-icons/md";
import { GoDotFill } from 'react-icons/go';
import {fetchReviewsForSpot} from '../../store/reviews'

function SpotDetails() {
    const { spotId } = useParams();
    const dispatch = useDispatch();

    const spotData = useSelector((state) => state.spots.spotDetails);
    const loggedInUser = useSelector((state) => state.session.user);

    const isOwner = loggedInUser && spotData.Owner?.id === loggedInUser.id;

    useEffect(() => {
        dispatch(fetchSpotDetails(spotId));
        dispatch(fetchReviewsForSpot(spotId))
    }, [dispatch, spotId]);

    if (!spotData || Object.keys(spotData).length === 0) {
        return <p>Loading spot details...</p>;
    }

    const mainImage = spotData.SpotImages?.length > 0 ? spotData.SpotImages[0].url : 'https://placehold.co/600x400/ffcc00/png';
    const extraImages = spotData.SpotImages?.slice(1, 5).map((img) => img.url) || []; // Ensure 4 images max

    return (
        <div className='spot-wrapper'>
            <div className='spot-header'>
                <h1 className='spot-title'>{spotData.name}</h1>
                <p className='spot-location'>{spotData.city}, {spotData.state}, {spotData.country}</p>
            </div>

            <div className='image-gallery'>
                <div className='primary-image'>
                    <img src={mainImage} alt={`${spotData.name} main`} />
                </div>
                <div className='additional-images'>
                    {extraImages.map((imgUrl, index) => (
                        <div className='gallery-image' key={index}>
                            <img src={imgUrl} alt={`${spotData.name} view ${index + 1}`} />
                        </div>
                    ))}
                </div>
            </div>

            <div className='details-container'>
                <div className='spot-info'>
                    <h3 className='spot-host'>Hosted by {spotData.Owner?.firstName} {spotData.Owner?.lastName}</h3>
                    <p className='spot-description'>{spotData.description}</p>
                </div>

                <div className='booking-section'>
                    <div className='booking-details'>
                        <span className='nightly-rate'>${spotData.price} per night</span>
                        <span className='rating-display'>
                            <MdOutlineStar /> {spotData.avgStarRating ? spotData.avgStarRating.toFixed(1) : 'New'}
                        </span>
                        {spotData.numReviews > 0 && <GoDotFill size={8} />}
                        {spotData.numReviews > 0 && (
                            <span className='review-count'>{spotData.numReviews} {spotData.numReviews === 1 ? 'Review' : 'Reviews'}</span>
                        )}
                    </div>
                    <button className='booking-button' onClick={() => alert('Feature coming soon')}>Reserve</button>
                </div>
            </div>

            <hr />

            <div className='reviews-section'>
                <div className='review-header'>
                    <h3><MdOutlineStar /> {spotData.avgStarRating ? spotData.avgStarRating.toFixed(1) : 'New'}</h3>
                    {spotData.numReviews > 0 && <GoDotFill size={8} />}
                    {spotData.numReviews > 0 && (
                        <h3>{spotData.numReviews} {spotData.numReviews === 1 ? 'Review' : 'Reviews'}</h3>
                    )}
                </div>

                {!isOwner && <p>Post a review!</p>}
            </div>
        </div>
    );
}

export default SpotDetails;

import "./CreateSpot.css";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { createSpot, updateSpot, fetchSpotDetails } from "../../store/spots";
import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { AMENITIES } from "../../constants/amenities";

function CreateSpot() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { spotId } = useParams();
    const user = useSelector((state) => state.session.user);
    const existingSpot = useSelector((state) => state.spots.spotDetails);

    const isUpdate = Boolean(spotId);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(isUpdate);

    const [spotData, setSpotData] = useState({
        name: "",
        address: "",
        city: "",
        state: "",
        country: "",
        price: "",
        description: "",
        latitude: "",
        longitude: "",
        bedrooms: "1",
        bathrooms: "1",
        beds: "1",
        guestCapacity: "2",
    });
    const [amenities, setAmenities] = useState([]);

    const [previewImage, setPreviewImage] = useState("");
    const [otherImages, setOtherImages] = useState(["", "", "", ""]);

    useEffect(() => {
        if (!user)
            navigate("/", {
                state: { error: "Please login to create a spot" },
                replace: true,
            });
        if (isUpdate) {
            setLoading(true);
            dispatch(fetchSpotDetails(spotId)).finally(() => setLoading(false));
        }
    }, [dispatch, spotId, user, navigate, isUpdate]);

    useEffect(() => {
        if (isUpdate && existingSpot) {
            setSpotData({
                name: existingSpot.name || "",
                address: existingSpot.address || "",
                city: existingSpot.city || "",
                state: existingSpot.state || "",
                country: existingSpot.country || "",
                price: existingSpot.price || "",
                description: existingSpot.description || "",
                latitude: existingSpot.lat || "",
                longitude: existingSpot.lng || "",
                bedrooms: existingSpot.bedrooms ?? "1",
                bathrooms: existingSpot.bathrooms ?? "1",
                beds: existingSpot.beds ?? "1",
                guestCapacity: existingSpot.guestCapacity ?? "2",
            });
            setAmenities(existingSpot.amenities || []);
            setPreviewImage(existingSpot.SpotImages?.[0]?.url || "");
            setOtherImages(
                existingSpot.SpotImages?.slice(1).map((img) => img.url) || [
                    "",
                    "",
                    "",
                    "",
                ]
            );
        }
    }, [existingSpot, isUpdate]);

    const handleChange = (e) => {
        setSpotData({ ...spotData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (index, value) => {
        const updatedImages = [...otherImages];
        updatedImages[index] = value;
        setOtherImages(updatedImages);
    };

    const toggleAmenity = (amenity) => {
        setAmenities((prev) =>
            prev.includes(amenity)
                ? prev.filter((a) => a !== amenity)
                : [...prev, amenity]
        );
    };

    const validateFields = () => {
        const errors = {};
        const urlRegex = /(png|jpg|jpeg)$/i;
        if (!spotData.name) errors.name = "A name is required";
        if (!spotData.address) errors.address = "An address is required";
        if (!spotData.city) errors.city = "A city is required";
        if (!spotData.state) errors.state = "A state is required";
        if (!spotData.country) errors.country = "A country is required";
        if (!spotData.price || spotData.price <= 0)
            errors.price = "Price must be greater than 0";
        if (!spotData.description || spotData.description.length < 30)
            errors.description = "Description must be at least 30 characters";
        if (!previewImage || !urlRegex.test(previewImage))
            errors.previewImage =
                "Image URL needs to end in .png or .jpg (or .jpeg)";
        otherImages.forEach((url) => {
            if (url.trim() && !urlRegex.test(url)) {
                errors.otherImages =
                    "All images must be valid URLs ending in .png, .jpg, or .jpeg";
            }
        });
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateFields();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const formattedData = {
            ...spotData,
            price: parseFloat(spotData.price),
            lat: spotData.latitude ? parseFloat(spotData.latitude) : null,
            lng: spotData.longitude ? parseFloat(spotData.longitude) : null,
            bedrooms: parseInt(spotData.bedrooms, 10) || 1,
            bathrooms: parseFloat(spotData.bathrooms) || 1,
            beds: parseInt(spotData.beds, 10) || 1,
            guestCapacity: parseInt(spotData.guestCapacity, 10) || 2,
            amenities,
        };
        const imageUrls = [
            previewImage,
            ...otherImages.filter((url) => url.trim()),
        ];

        try {
            const spot = isUpdate
                ? await dispatch(updateSpot(spotId, formattedData))
                : await dispatch(createSpot(formattedData, imageUrls));
            navigate(`/spots/${spot.id}`);
        } catch (error) {
            console.error("Error submitting spot:", error);
        }
    };

    if (loading) {
        return (
            <div className="create-spot-container">
                <Skeleton height={40} count={8} />
            </div>
        );
    }

    return (
        <div className="create-spot-container" role="main">
            <h1 tabIndex={0}>
                {isUpdate ? "Update Your Spot" : "Create a New Spot"}
            </h1>
            <form onSubmit={handleSubmit}>
                <h2>Location Details</h2>
                <label>
                    Country
                    <input
                        name="country"
                        value={spotData.country}
                        onChange={handleChange}
                        aria-label="Country"
                        tabIndex={0}
                    />
                </label>
                {errors.country && (
                    <span className="error-message">{errors.country}</span>
                )}

                <label>
                    Street Address
                    <input
                        name="address"
                        value={spotData.address}
                        onChange={handleChange}
                        aria-label="Street Address"
                        tabIndex={0}
                    />
                </label>
                {errors.address && (
                    <span className="error-message">{errors.address}</span>
                )}

                <label>
                    City
                    <input
                        name="city"
                        value={spotData.city}
                        onChange={handleChange}
                        aria-label="City"
                        tabIndex={0}
                    />
                </label>
                {errors.city && (
                    <span className="error-message">{errors.city}</span>
                )}

                <label>
                    State
                    <input
                        name="state"
                        value={spotData.state}
                        onChange={handleChange}
                        aria-label="State"
                        tabIndex={0}
                    />
                </label>
                {errors.state && (
                    <span className="error-message">{errors.state}</span>
                )}

                <h2>Tell Guests About Your Place</h2>
                <label>
                    Description
                    <textarea
                        name="description"
                        value={spotData.description}
                        onChange={handleChange}
                        aria-label="Description"
                        tabIndex={0}
                    />
                </label>
                {errors.description && (
                    <span className="error-message">{errors.description}</span>
                )}

                <h2>Give Your Spot a Catchy Name</h2>
                <label>
                    Name
                    <input
                        name="name"
                        value={spotData.name}
                        onChange={handleChange}
                        aria-label="Spot Name"
                        tabIndex={0}
                    />
                </label>
                {errors.name && (
                    <span className="error-message">{errors.name}</span>
                )}

                <h2>Set Your Price</h2>
                <label>
                    Price
                    <input
                        name="price"
                        type="number"
                        min="1"
                        value={spotData.price}
                        onChange={handleChange}
                        aria-label="Price"
                        tabIndex={0}
                    />
                </label>
                {errors.price && (
                    <span className="error-message">{errors.price}</span>
                )}

                <h2>Share the Basics</h2>
                <div className="spot-basics-row">
                    <label>
                        Bedrooms
                        <input
                            name="bedrooms"
                            type="number"
                            min="0"
                            max="20"
                            value={spotData.bedrooms}
                            onChange={handleChange}
                            aria-label="Bedrooms"
                        />
                    </label>
                    <label>
                        Bathrooms
                        <input
                            name="bathrooms"
                            type="number"
                            min="0"
                            max="20"
                            step="0.5"
                            value={spotData.bathrooms}
                            onChange={handleChange}
                            aria-label="Bathrooms"
                        />
                    </label>
                    <label>
                        Beds
                        <input
                            name="beds"
                            type="number"
                            min="1"
                            max="30"
                            value={spotData.beds}
                            onChange={handleChange}
                            aria-label="Beds"
                        />
                    </label>
                    <label>
                        Guests
                        <input
                            name="guestCapacity"
                            type="number"
                            min="1"
                            max="50"
                            value={spotData.guestCapacity}
                            onChange={handleChange}
                            aria-label="Guest capacity"
                        />
                    </label>
                </div>

                <h2>Amenities</h2>
                <div className="amenities-checkbox-grid">
                    {AMENITIES.map((amenity) => (
                        <label key={amenity} className="amenity-checkbox">
                            <input
                                type="checkbox"
                                checked={amenities.includes(amenity)}
                                onChange={() => toggleAmenity(amenity)}
                            />
                            {amenity}
                        </label>
                    ))}
                </div>

                <h2>Showcase Your Spot with Photos</h2>
                <label>
                    Preview Image URL
                    <input
                        value={previewImage}
                        onChange={(e) => setPreviewImage(e.target.value)}
                        aria-label="Preview Image URL"
                        tabIndex={0}
                    />
                </label>
                {errors.previewImage && (
                    <span className="error-message">{errors.previewImage}</span>
                )}

                {otherImages.map((url, index) => (
                    <div key={index}>
                        <input
                            placeholder="Image URL"
                            value={url}
                            onChange={(e) =>
                                handleImageChange(index, e.target.value)
                            }
                            aria-label={`Additional Image URL ${index + 1}`}
                            tabIndex={0}
                        />
                        {errors.otherImages && (
                            <span className="error-message">
                                {errors.otherImages}
                            </span>
                        )}
                    </div>
                ))}

                <div className="button-container">
                    <motion.button
                        type="submit"
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ scale: 1.03 }}
                        aria-label={isUpdate ? "Update Listing" : "Create Spot"}
                    >
                        {isUpdate ? "Update Listing" : "Create Spot"}
                    </motion.button>
                </div>
            </form>
        </div>
    );
}

export default CreateSpot;

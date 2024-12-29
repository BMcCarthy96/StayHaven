const express = require("express");
const router = express.Router();
const {
    Spot,
    Review,
    SpotImage,
    User,
    Booking,
    ReviewImage,
} = require("../../db/models");
const { requireAuth } = require("../../utils/auth");
const { Op } = require("sequelize");

// Middleware for validating query parameters
const validateQueryParams = (req, res, next) => {
    const errors = {};
    const { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } =
        req.query;

    const validateNumber = (value, field, min = -Infinity, max = Infinity) => {
        if (
            value !== undefined &&
            (isNaN(value) || value < min || value > max)
        ) {
            errors[field] = `${field} must be a valid number${
                min !== -Infinity ? ` >= ${min}` : ""
            }${max !== Infinity ? ` and <= ${max}` : ""}`;
        }
    };

    validateNumber(page, "page", 1);
    validateNumber(size, "size", 1, 20);
    validateNumber(minLat, "minLat", -90, 90);
    validateNumber(maxLat, "maxLat", -90, 90);
    validateNumber(minLng, "minLng", -180, 180);
    validateNumber(maxLng, "maxLng", -180, 180);
    validateNumber(minPrice, "minPrice", 0);
    validateNumber(maxPrice, "maxPrice", 0);

    if (Object.keys(errors).length) {
        return res.status(400).json({ message: "Bad Request", errors });
    }

    req.query.page = parseInt(page) || 1;
    req.query.size = parseInt(size) || 20;
    req.query.minLat = minLat ? parseFloat(minLat) : undefined;
    req.query.maxLat = maxLat ? parseFloat(maxLat) : undefined;
    req.query.minLng = minLng ? parseFloat(minLng) : undefined;
    req.query.maxLng = maxLng ? parseFloat(maxLng) : undefined;
    req.query.minPrice = minPrice ? parseFloat(minPrice) : undefined;
    req.query.maxPrice = maxPrice ? parseFloat(maxPrice) : undefined;

    next();
};

// Helper function to calculate average star rating
const calculateAvgStarRating = async (spotId) => {
    const reviews = await Review.findAll({ where: { spotId } });
    if (!reviews.length) return 0;
    const totalStars = reviews.reduce((sum, review) => sum + review.stars, 0);
    return parseFloat((totalStars / reviews.length).toFixed(1));
};

// Helper function to retrieve preview image URL
const getPreviewImage = async (spotId) => {
    const image = await SpotImage.findOne({
        where: { spotId },
        attributes: ["url"],
    });
    return image ? image.url : "No preview image available";
};

// Route: Fetch spots with optional filters and pagination
router.get("/", validateQueryParams, async (req, res) => {
    const { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } =
        req.query;

    const filters = {};
    if (minLat) filters.lat = { [Op.gte]: minLat };
    if (maxLat) filters.lat = { [Op.lte]: maxLat };
    if (minLng) filters.lng = { [Op.gte]: minLng };
    if (maxLng) filters.lng = { [Op.lte]: maxLng };
    if (minPrice) filters.price = { [Op.gte]: minPrice };
    if (maxPrice) filters.price = { [Op.lte]: maxPrice };

    const spots = await Spot.findAll({
        where: filters,
        limit: size,
        offset: (page - 1) * size,
        attributes: [
            "id",
            "ownerId",
            "address",
            "city",
            "state",
            "country",
            "lat",
            "lng",
            "name",
            "description",
            "price",
            "createdAt",
            "updatedAt",
        ],
    });

    const spotsWithDetails = await Promise.all(
        spots.map(async (spot) => ({
            ...spot.toJSON(),
            avgRating: await calculateAvgStarRating(spot.id),
            previewImage: await getPreviewImage(spot.id),
        }))
    );

    res.status(200).json({ Spots: spotsWithDetails, page, size });
});

// Get all Spots owned by the current user
router.get("/current", requireAuth, async (req, res) => {
    const spots = await Spot.findAll({ where: { ownerId: req.user.id } });
    const spotsWithDetails = await Promise.all(
        spots.map(async (spot) => {
            const reviews = await Review.findAll({
                where: { spotId: spot.id },
                attributes: ["stars"],
            });
            const { avgRating } = calculateAvgRatingAndReviews(reviews);
            const previewImage = await SpotImage.findOne({
                where: { spotId: spot.id, preview: true },
                attributes: ["url"],
            });
            return {
                ...spot.toJSON(),
                avgRating,
                previewImage: previewImage?.url || null,
            };
        })
    );
    res.json({ Spots: spotsWithDetails });
});

// Helper function to calculate average rating and number of reviews
function calculateExtraDetails({ Reviews, ...spot }) {
    const reviewCount = Reviews.length;
    const totalStars = Reviews.reduce((sum, review) => sum + review.stars, 0);
    return {
        ...spot,
        numReviews: reviewCount,
        avgStarRating: reviewCount
            ? parseFloat((totalStars / reviewCount).toFixed(1))
            : 0,
    };
}

// Get details of a Spot from its id
router.get("/:spotId", async (req, res) => {
    const { spotId } = req.params;

    const spot = await Spot.findByPk(spotId, {
        include: [
            { model: Review, attributes: ["stars"] },
            { model: SpotImage, attributes: ["id", "url", "preview"] },
            {
                model: User,
                as: "Owner",
                attributes: ["id", "firstName", "lastName"],
            },
        ],
    });

    if (!spot) {
        return res.status(404).json({ message: "Spot couldn't be found" });
    }

    const spotWithDetails = calculateExtraDetails(spot.toJSON());
    return res.json(spotWithDetails);
});

// Create a Spot
router.post("/", requireAuth, async (req, res) => {
    const requiredFields = [
        "address",
        "city",
        "state",
        "country",
        "name",
        "description",
        "price",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
        return res.status(400).json({
            message: "Bad Request",
            errors: {
                address: "Street address is required",
                city: "City is required",
                state: "State is required",
                country: "Country is required",
                lat: "Latitude is not valid",
                lng: "Longitude must be within -180 and 180",
                name: "Name must be less than 50 characters",
                description: "Description is required",
                price: "Price per day must be a positive number",
            },
        });
    }

    try {
        const newSpot = await Spot.create({
            ownerId: req.user.id,
            ...req.body,
        });

        return res.status(201).json(newSpot);
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Internal Server Error", error: error.message });
    }
});

// Add an Image to a Spot based on the Spot's id
router.post("/:spotId/images", requireAuth, async (req, res) => {
    const { spotId } = req.params;
    const { url, preview } = req.body;

    try {
        const spot = await Spot.findByPk(spotId);

        if (!spot) {
            return res.status(404).json({ message: "Spot couldn't be found" });
        }

        if (spot.ownerId !== req.user.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const newImage = await SpotImage.create({ url, preview, spotId });

        return res.status(201).json({
            id: newImage.id,
            url: newImage.url,
            preview: newImage.preview,
        });
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Internal Server Error", error: error.message });
    }
});

// Edit a Spot
router.put("/:id", requireAuth, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const {
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price,
    } = req.body;

    try {
        const spot = await Spot.findByPk(id);

        if (!spot) {
            return res.status(404).json({ message: "Spot couldn't be found" });
        }

        if (spot.ownerId !== userId) {
            return res.status(403).json({
                message: "Forbidden - You are not the owner of this spot",
            });
        }

        if (
            !address ||
            !city ||
            !state ||
            !country ||
            !name ||
            !description ||
            !price
        ) {
            return res.status(400).json({
                message: "Bad Request",
                errors: {
                    address: "Street address is required",
                    city: "City is required",
                    state: "State is required",
                    country: "Country is required",
                    lat: "Latitude is not valid",
                    lng: "Longitude must be within -180 and 180",
                    name: "Name must be less than 50 characters",
                    description: "Description is required",
                    price: "Price per day must be a positive number",
                },
            });
        }

        // Update the spot and respond
        const updatedSpot = await spot.update({
            address,
            city,
            state,
            country,
            lat,
            lng,
            name,
            description,
            price,
        });

        return res.json(updatedSpot);
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Internal Server Error", error: error.message });
    }
});

// Delete a Spot
router.delete("/:id", requireAuth, async (req, res) => {
    const { id: spotId } = req.params;
    const userId = req.user.id;

    try {
        const spot = await Spot.findByPk(spotId);

        if (!spot) {
            return res.status(404).json({ message: "Spot couldn't be found" });
        }

        if (spot.ownerId !== userId) {
            return res.status(403).json({
                message: "Forbidden - You are not the owner of this spot",
            });
        }

        await spot.destroy();
        return res.json({ message: "Successfully deleted" });
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Internal Server Error", error: error.message });
    }
});

// Get all Reviews by a Spot's id
router.get("/:spotId/reviews", async (req, res) => {
    const { spotId } = req.params;

    try {
        // Check if the spot exists
        const spot = await Spot.findByPk(spotId);
        if (!spot) {
            return res.status(404).json({ message: "Spot couldn't be found" });
        }

        // Fetch all reviews for the spot
        const reviews = await Review.findAll({
            where: { spotId },
            include: [
                {
                    model: User,
                    attributes: ["id", "firstName", "lastName"],
                },
                {
                    model: ReviewImage,
                    attributes: ["id", "url"],
                },
            ],
        });

        return res.json({ Reviews: reviews });
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Internal Server Error", error: error.message });
    }
});

// Create a Review for a Spot based on the Spot's id
router.post("/:id/reviews", requireAuth, async (req, res) => {
    const { review, stars } = req.body;
    const spotId = req.params.id;
    const userId = req.user.id;

    try {
        // Validate request body
        if (!review || !stars || stars < 1 || stars > 5) {
            return res.status(400).json({
                message: "Validation Error",
                errors: {
                    review: "Review text is required",
                    stars: "Stars must be an integer from 1 to 5",
                },
            });
        }

        // Check if the spot exists
        const spot = await Spot.findByPk(spotId);
        if (!spot) {
            return res.status(404).json({ message: "Spot couldn't be found" });
        }

        // Check if the user has already reviewed this spot
        const existingReview = await Review.findOne({
            where: { spotId, userId },
        });
        if (existingReview) {
            return res
                .status(403)
                .json({ message: "User already has a review for this spot" });
        }

        // Create a new review
        const newReview = await Review.create({
            userId,
            spotId,
            review,
            stars,
        });

        return res.status(201).json(newReview);
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Internal Server Error", error: error.message });
    }
});

// Get all bookings for a Spot based on the Spot's id
router.get("/:spotId/bookings", requireAuth, async (req, res) => {
    const spotId = req.params.spotId;
    const userId = req.user.id;

    try {
        // Check if the spot exists
        const spot = await Spot.findByPk(spotId);
        if (!spot) {
            return res.status(404).json({ message: "Spot couldn't be found" });
        }

        let bookings;
        const bookingAttributes = ["spotId", "startDate", "endDate"];

        // If the user is not the owner, limit the attributes
        if (spot.ownerId !== userId) {
            bookings = await Booking.findAll({
                where: { spotId },
                attributes: bookingAttributes,
            });
        } else {
            // If the user is the owner, include user details
            bookings = await Booking.findAll({
                where: { spotId },
                attributes: [
                    ...bookingAttributes,
                    "id",
                    "userId",
                    "createdAt",
                    "updatedAt",
                ],
                include: [
                    {
                        model: User,
                        attributes: ["id", "firstName", "lastName"],
                    },
                ],
            });
        }

        return res.status(200).json({ Bookings: bookings });
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Internal Server Error", error: error.message });
    }
});

// Create a Booking for a Spot based on the Spot's id
router.post("/:spotId/bookings", requireAuth, async (req, res) => {
    const { spotId } = req.params;
    const userId = req.user.id;
    const { startDate, endDate } = req.body;

    try {
        // Find the spot
        const spot = await Spot.findByPk(spotId);

        // Error: Spot not found
        if (!spot) {
            return res.status(404).json({ message: "Spot couldn't be found" });
        }

        // Check if user is the owner of the spot
        if (spot.ownerId === userId) {
            return res
                .status(403)
                .json({ message: "Cannot book your own spot" });
        }

        // Validation: Check startDate and endDate
        const errors = {};
        const currentDate = new Date().toISOString().split("T")[0];

        if (!startDate || !endDate) {
            errors.startDate = "startDate cannot be in the past";
            errors.endDate = "endDate cannot be on or before startDate";
        }

        if (endDate < startDate) {
            errors.endDate = "End date cannot be on or before startDate";
        }

        if (startDate === endDate) {
            errors.endDate = "Start date cannot be the same as End date";
        }

        if (startDate < currentDate) {
            errors.startDate = "Start date cannot be in the past";
        }

        // If there are validation errors
        if (Object.keys(errors).length) {
            return res.status(400).json({ message: "Bad Request", errors });
        }

        // Check for booking conflicts
        const existingBooking = await Booking.findOne({
            where: {
                spotId,
                [Op.or]: [
                    { startDate: { [Op.between]: [startDate, endDate] } },
                    { endDate: { [Op.between]: [startDate, endDate] } },
                ],
            },
        });

        if (existingBooking) {
            return res.status(403).json({
                message:
                    "Sorry, this spot is already booked for the specified dates",
                errors: {
                    startDate: "Start date conflicts with an existing booking",
                    endDate: "End date conflicts with an existing booking",
                },
            });
        }

        // Create new booking
        const newBooking = await Booking.create({
            spotId,
            userId,
            startDate,
            endDate,
        });

        return res.status(201).json(newBooking);
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Internal Server Error", error: error.message });
    }
});

module.exports = router;

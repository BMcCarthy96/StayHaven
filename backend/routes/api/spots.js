const express = require("express");
const router = express.Router();

const {
    User,
    Spot,
    Review,
    Booking,
    SpotImage,
    ReviewImage,
} = require("../../db/models");
const { requireAuth } = require("../../utils/auth");
const { check, validationResult } = require("express-validator");
const { Op } = require("sequelize");

// Middleware for validating query parameters
const validateQueryParams = (req, res, next) => {
    const errors = {};
    const { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } =
        req.query;

    // Validate page
    if (page !== undefined && isNaN(page)) {
        errors.page = "Page must be greater than or equal to 1";
    }
    if (page < 1) {
        errors.page = "Page must be greater than or equal to 1";
    }

    // Validate size
    if (size !== undefined && isNaN(size)) {
        errors.size = "Size must be between 1 and 20";
    }
    if (size < 1 || size > 20) {
        errors.size = "Size must be between 1 and 20";
    }

    // Validate optional filters
    if (minLat && (isNaN(minLat) || minLat < -90 || minLat > 90)) {
        errors.minLat = "Minimum latitude is invalid";
    }
    if (maxLat && (isNaN(maxLat) || maxLat < -90 || maxLat > 90)) {
        errors.maxLat = "Maximum latitude is invalid";
    }
    if (minLng && (isNaN(minLng) || minLng < -180 || minLng > 180)) {
        errors.minLng = "Minimum longitude is invalid";
    }
    if (maxLng && (isNaN(maxLng) || maxLng < -180 || maxLng > 180)) {
        errors.maxLng = "Maximum longitude is invalid";
    }
    if (minPrice && (isNaN(minPrice) || minPrice < 0)) {
        errors.minPrice = "Minimum price must be greater than or equal to 0";
    }
    if (maxPrice && (isNaN(maxPrice) || maxPrice < 0)) {
        errors.maxPrice = "Maximum price must be greater than or equal to 0";
    }

    if (Object.keys(errors).length) {
        return res.status(400).json({
            message: "Bad Request",
            errors: {
                page: "Page must be greater than or equal to 1",
                size: "Size must be between 1 and 20",
                maxLat: "Maximum latitude is invalid",
                minLat: "Minimum latitude is invalid",
                minLng: "Minimum longitude is invalid",
                maxLng: "Maximum longitude is invalid",
                minPrice: "Minimum price must be greater than or equal to 0",
                maxPrice: "Maximum price must be greater than or equal to 0",
            },
        });
    }

    req.query.page = parseInt(page);
    req.query.size = parseInt(size);
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
    let totalStars = 0;
    let reviewCount = 0;
    reviews.forEach((review) => {
        totalStars += review.stars;
        reviewCount++;
    });

    if (reviewCount > 0) {
        return parseFloat((totalStars / reviewCount).toFixed(1));
    } else {
        return 0;
    }
};

// Helper function to retrieve preview image URL
const getPreviewImage = async (spotId) => {
    const image = await SpotImage.findOne({ where: { spotId } });
    if (image) {
        return image.url;
    } else {
        return "No preview image available";
    }
};

router.get("/", validateQueryParams, async (req, res) => {
    let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } =
        req.query;

    if (isNaN(page)) {
        page = 1;
    }
    if (isNaN(size)) {
        size = 20;
    }

    page = parseInt(page);
    size = parseInt(size);

    if (size > 20) size = 20;
    if (page < 1) page = 1;

    const filters = {};
    if (minLat) filters.lat = { ...filters.lat, [Op.gte]: parseFloat(minLat) };
    if (maxLat) filters.lat = { ...filters.lat, [Op.lte]: parseFloat(maxLat) };

    if (minLng) filters.lng = { ...filters.lng, [Op.gte]: parseFloat(minLng) };
    if (maxLng) filters.lng = { ...filters.lng, [Op.lte]: parseFloat(maxLng) };

    if (minPrice)
        filters.price = { ...filters.price, [Op.gte]: parseFloat(minPrice) };
    if (maxPrice)
        filters.price = { ...filters.price, [Op.lte]: parseFloat(maxPrice) };

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
        spots.map(async (spot) => {
            spot.lat = parseFloat(spot.lat);
            spot.lng = parseFloat(spot.lng);
            spot.price = parseFloat(spot.price);
            const avgRating = await calculateAvgStarRating(spot.id);
            const previewImage = await getPreviewImage(spot.id);
            return {
                ...spot.toJSON(),
                avgRating,
                previewImage,
            };
        })
    );

    const response = {
        Spots: spotsWithDetails,
        page: parseInt(page),
        size: parseInt(size),
    };

    return res.status(200).json(response);
});

// Get all Spots owned by the Current User
router.get("/current", requireAuth, async (req, res) => {
    const spots = await Spot.findAll({
        where: {
            ownerId: req.user.id,
        },
    });
    const spotsWithDetails = await Promise.all(
        spots.map(async (spot) => {
            const avgRating = await calculateAvgStarRating(spot.id);
            const previewImage = await getPreviewImage(spot.id);
            return {
                ...spot.toJSON(),
                avgRating,
                previewImage,
            };
        })
    );
    return res.json({ Spots: spotsWithDetails });
});

// Helper function for calculating average rating and numReviews to get details of a spot from id
function calculateExtraDetails(spot) {
    let totalStars = 0;
    let reviewCount = 0;
    spot.Reviews.forEach((review) => {
        totalStars += review.stars;
        reviewCount++;
    });

    if (reviewCount > 0) {
        spot.numReviews = reviewCount;
        spot.avgStarRating = parseFloat((totalStars / reviewCount).toFixed(1));
    } else {
        spot.avgStarRating = 0;
        spot.numReviews = 0;
    }
    delete spot.Reviews;
    return spot;
}

// Get details of a Spot from an id
router.get("/:spotId", async (req, res) => {
    const { spotId } = req.params;
    const spot = await Spot.findByPk(spotId, {
        include: [
            {
                model: Review,
                attributes: ["stars"],
            },
            {
                model: SpotImage,
                attributes: ["id", "url", "preview"],
            },
            {
                model: User,
                as: "Owner",
                attributes: ["id", "firstName", "lastName"],
            },
        ],
    });
    if (!spot) {
        return res.status(404).json({
            message: "Spot couldn't be found",
        });
    }
    let final = calculateExtraDetails(spot.toJSON());
    return res.json(final);
});

// Create a Spot
router.post("/", requireAuth, async (req, res) => {
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
    const newSpot = await Spot.create({
        ownerId: req.user.id,
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
    return res.status(201).json(newSpot);
});

// Add an Image to a Spot based on the Spot's id
router.post("/:spotId/images", requireAuth, async (req, res) => {
    const { spotId } = req.params;
    const { url, preview } = req.body;
    const userId = req.user.id;

    const spot = await Spot.findByPk(spotId);

    if (!spot) {
        return res.status(404).json({
            message: "Spot couldn't be found",
        });
    }

    // Check if current user is the owner of the spot
    if (spot.ownerId !== userId) {
        return res.status(403).json({
            message: "Forbidden",
        });
    }

    // Create/add the image
    const newImage = await SpotImage.create({
        url,
        preview,
        spotId,
    });
    return res.status(201).json({
        id: newImage.id,
        url: newImage.url,
        preview: newImage.preview,
    });
});

//Edit a Spot
router.put("/:id", requireAuth, async (req, res) => {
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

    const spot = await Spot.findByPk(req.params.id);

    if (!spot) {
        return res.status(404).json({
            message: "Spot couldn't be found",
        });
    }

    // Check if owner of spot
    if (spot.ownerId !== userId) {
        return res
            .status(403)
            .json({
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

    const updated = await spot.update({
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
    return res.json({
        id: updated.id,
        ownerId: updated.ownerId,
        address: updated.address,
        city: updated.city,
        state: updated.state,
        country: updated.country,
        lat: updated.lat,
        lng: updated.lng,
        name: updated.name,
        description: updated.description,
        price: updated.price,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
    });
});

// Delete a Spot
router.delete("/:id", requireAuth, async (req, res) => {
    const spotId = req.params.id;
    const userId = req.user.id;
    const spot = await Spot.findByPk(spotId);
    // Check if spot exists
    if (!spot) {
        return res.status(404).json({
            message: "Spot couldn't be found",
        });
    }

    // Check if current user is the owner of the spot
    if (spot.ownerId !== userId) {
        return res.status(403).json({
            message: "Forbidden - You are not the owner of this spot",
        });
    }
    await spot.destroy();
    return res.json({ message: "Successfully deleted" });
});

// Get all Reviews by a Spot's id
router.get("/:spotId/reviews", async (req, res) => {
    const { spotId } = req.params;

    // Check if spot exists
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
        return res.status(404).json({
            message: "Spot couldn't be found",
        });
    }

    // Find all reviews for the spot
    const reviews = await Review.findAll({
        where: {
            spotId,
        },
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

    if (!reviews) {
        return res.status(404).json({
            message: "Review couldn't be found",
        });
    }

    return res.json({ Reviews: reviews });
});

// Create a Review for a Spot based on the Spot's id
router.post("/:id/reviews", requireAuth, async (req, res) => {
    const { review, stars } = req.body;
    const spotId = req.params.id;
    const userId = req.user.id;

    if (!review || !stars) {
        return res.status(400).json({
            message: "Validation Error",
            errors: {
                review: "Review text is required",
                stars: "Stars must be an integer from 1 to 5",
            },
        });
    }

    const spot = await Spot.findByPk(spotId);
    if (!spot) {
        return res.status(404).json({
            message: "Spot couldn't be found",
        });
    }

    const existingReview = await Review.findOne({
        where: {
            spotId: spotId,
            userId: userId,
        },
    });
    if (existingReview) {
        return res.status(500).json({
            message: "User already has a review for this spot",
        });
    }

    const newReview = await Review.create({
        userId,
        spotId,
        review,
        stars,
    });

    return res.status(201).json(newReview);
});

// Get all bookings for a Spot based on the Spot's id
router.get("/:spotId/bookings", requireAuth, async (req, res) => {
    const spotId = req.params.spotId;
    const spot = await Spot.findByPk(spotId);
    // Check if spot exists
    if (!spot) {
        return res.status(404).json({
            message: "Spot couldn't be found",
        });
    }

    let bookings;

    //if you're NOT the owner of the spot
    if (spot.ownerId !== req.user.id) {
        bookings = await Booking.findAll({
            where: {
                spotId,
            },
            attributes: ["spotId", "startDate", "endDate"],
        });
    }

    // if you're the owner of the spot
    if (spot.ownerId === req.user.id) {
        bookings = await Booking.findAll({
            where: {
                spotId,
            },
            attributes: [
                "id",
                "spotId",
                "userId",
                "startDate",
                "endDate",
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
});

// Create a Booking from a Spot based on the Spot's id
router.post("/:spotId/bookings", requireAuth, async (req, res) => {
    const { spotId } = req.params;
    const userId = req.user.id;
    const { startDate, endDate } = req.body;

    const spot = await Spot.findByPk(spotId);
    //check to make sure the user is not the owner of the spot
    if (spot.ownerId === userId) {
        return res.status(404).json({
            message: "Cannot book your own spot",
        });
    }

    if (!startDate || !endDate) {
        return res.status(400).json({
            message: "Bad Request",
            errors: {
                startDate: "startDate cannot be in the past",
                endDate: "endDate cannot be on or before startDate",
            },
        });
    }

    if (endDate < startDate) {
        return res.status(400).json({
            message: "Bad Request",
            errors: {
                endDate: "End date cannot be on or before startDate",
            },
        });
    }

    if (startDate === endDate) {
        return res.status(400).json({
            message: "Bad Request",
            errors: {
                endDate: "Start date cannot be the same as End date",
            },
        });
    }

    const date = new Date().toString();
    if (startDate < date) {
        return res.status(400).json({
            message: "Bad Request",
            errors: {
                startDate: "Start date cannot be in the past",
            },
        });
    }

    if (!spot) {
        return res.status(404).json({
            message: "Spot couldn't be found",
        });
    }

    const existingBooking = await Booking.findOne({
        where: {
            [Op.or]: [
                {
                    startDate: {
                        [Op.between]: [startDate, endDate],
                    },
                },
                {
                    endDate: {
                        [Op.between]: [startDate, endDate],
                    },
                },
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
    const newBooking = await Booking.create({
        spotId,
        userId: req.user.id,
        startDate,
        endDate,
    });
    return res.json(newBooking);
});

module.exports = router;

const express = require("express");
const router = express.Router();
const { Op } = require("Sequelize");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const {
    Spot,
    SpotImage,
    Review,
    ReviewImage,
    User,
} = require("../../db/models");
const { Model, json } = require("sequelize");
const { requireAuth, requireAuthorization } = require("../../utils/auth");
const { parse } = require("dotenv");
const review = require("../../db/models/review");

const validateSpot = [
    check("address").notEmpty().withMessage("Street address is required"),
    check("city").notEmpty().withMessage("City is required"),
    check("state").notEmpty().withMessage("State is required"),
    check("country").notEmpty().withMessage("Country is required"),
    check("lat")
        .notEmpty()
        .withMessage("Latitude is required")
        .isFloat({ min: -90, max: 90 })
        .withMessage("Latitude must be within -90 and 90"),
    check("lng")
        .notEmpty()
        .withMessage("Longitude is required")
        .isFloat({ min: -180, max: 180 })
        .withMessage("Longitude must be within -180 and 180"),
    check("name")
        .notEmpty()
        .withMessage("Name cannot be empty")
        .isLength({ max: 50 })
        .withMessage("Name must be less than 50 characters"),
    check("description").notEmpty().withMessage("Description is required"),
    check("price")
        .notEmpty()
        .withMessage("Price cannot be empty")
        .isFloat({ gt: 0 })
        .withMessage("Price per day must be a positive number"),
    handleValidationErrors,
];

const validateReview = (req, res, next) => {
    const { review, stars } = req.body;
    const errors = {};

    if (!review) errors.review = "Review text is required";
    if (!stars || stars < 1 || stars > 5)
        errors.stars = "Stars must be an integer from 1 to 5";

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            message: "Validation error",
            errors: errors,
        });
    }
    next();
};

const getAverage = (arr) => {
    if (!arr.length) return null;

    const sum = arr.reduce((acc, val) => acc + val, 0);
    return parseFloat((sum / arr.length).toFixed(1));
};

const countReviews = (arr) => arr.length;

// Get all spots
router.get("/", async (req, res, next) => {
    try {
        const {
            page = 1,
            size = 20,
            minLat,
            maxLat,
            minLng,
            maxLng,
            minPrice,
            maxPrice,
        } = req.query;

        const pagination = {};
        const errors = {};

        const parsedPage = parseInt(page, 10);
        const parsedSize = parseInt(size, 10);

        if (parsedPage >= 1 && parsedSize >= 1 && parsedSize <= 20) {
            pagination.limit = parsedSize;
            pagination.offset = (parsedPage - 1) * parsedSize;
        } else {
            errors.page = "Page must be greater than or equal to 1";
            errors.size = "Size must be between 1 and 20";
        }

        const where = {};

        const validateRange = (value, min, max, errorKey, errorMessage) => {
            if (value && (isNaN(value) || value < min || value > max)) {
                errors[errorKey] = errorMessage;
            }
            return value ? parseFloat(value) : undefined;
        };

        const addCondition = (key, operator, value) => {
            if (value !== undefined) {
                where[key] = { ...where[key], [operator]: value };
            }
        };

        const validatedMinLat = validateRange(
            minLat,
            -90,
            90,
            "minLat",
            "minLat must be a number between -90 and 90"
        );
        const validatedMaxLat = validateRange(
            maxLat,
            -90,
            90,
            "maxLat",
            "maxLat must be a number between -90 and 90"
        );
        const validatedMinLng = validateRange(
            minLng,
            -180,
            180,
            "minLng",
            "minLng must be a number between -180 and 180"
        );
        const validatedMaxLng = validateRange(
            maxLng,
            -180,
            180,
            "maxLng",
            "maxLng must be a number between -180 and 180"
        );
        const validatedMinPrice = validateRange(
            minPrice,
            0,
            Infinity,
            "minPrice",
            "minPrice must be a number greater than or equal to 0"
        );
        const validatedMaxPrice = validateRange(
            maxPrice,
            0,
            Infinity,
            "maxPrice",
            "maxPrice must be a number greater than or equal to 0"
        );

        addCondition("lat", Op.gte, validatedMinLat);
        addCondition("lat", Op.lte, validatedMaxLat);
        addCondition("lng", Op.gte, validatedMinLng);
        addCondition("lng", Op.lte, validatedMaxLng);
        addCondition("price", Op.gte, validatedMinPrice);
        addCondition("price", Op.lte, validatedMaxPrice);

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ message: "Bad Request", errors });
        }

        const spots = await Spot.findAll({
            include: [
                { model: Review, attributes: ["stars"] },
                { model: SpotImage, attributes: ["url"] },
            ],
            where,
            ...pagination,
        });

        const spotList = spots.map((spot) => {
            const spotData = spot.toJSON();

            const avgRating = spotData.Reviews?.length
                ? spotData.Reviews.reduce(
                      (acc, review) => acc + review.stars,
                      0
                  ) / spotData.Reviews.length
                : 0;

            const previewImage = spot.SpotImages?.[0]?.url || null;

            return {
                ...spotData,
                lat: parseFloat(spotData.lat),
                lng: parseFloat(spotData.lng),
                price: parseFloat(spotData.price),
                avgRating,
                previewImage,
            };
        });

        res.status(200).json({
            Spots: spotList,
            page: parsedPage,
            size: parsedSize,
        });
    } catch (err) {
        next(err);
    }
});

// Create a spot
router.post("/", requireAuth, validateSpot, async (req, res, next) => {
    try {
        const {
            address,
            city,
            state,
            country,
            lat,
            lng,
            name,
            price,
            description,
        } = req.body;
        const { id: ownerId } = req.user;

        const newSpot = await Spot.create({
            ownerId,
            address,
            city,
            state,
            country,
            lat,
            lng,
            name,
            price,
            description,
        });

        return res.status(201).json(newSpot);
    } catch (error) {
        next(error);
    }
});

// Get all spots owned by the current user
router.get("/current", requireAuth, async (req, res, next) => {
    const currentId = req.user.dataValues.id;
    const spots = await Spot.findAll({
        where: { ownerId: currentId },
        include: [
            {
                model: SpotImage,
                attributes: ["url"],
            },
            {
                model: Review,
                attributes: ["stars"],
            },
        ],
    });

    const formattedSpots = spots.map((spot) => {
        const reviews = spot.Reviews;
        const spotRatings = reviews.map((reviewStars) => reviewStars.stars);
        const avgRating = getAverage(spotRatings);
        const spotImagesDetails = spot.SpotImages;
        const url = spotImagesDetails.map((element) => element.dataValues.url);

        return {
            id: spot.id,
            ownerId: spot.ownerId,
            address: spot.address,
            city: spot.city,
            state: spot.state,
            country: spot.country,
            lat: spot.lat,
            lng: spot.lng,
            name: spot.name,
            description: spot.description,
            price: spot.price,
            createdAt: spot.createdAt,
            updatedAt: spot.updatedAt,
            avgRating: avgRating,
            previewImage: url[0],
        };
    });

    res.json({
        Spots: formattedSpots,
    });
});

// Get details of a spot from an id
router.get("/:spotId", async (req, res, next) => {
    try {
        if (!(await Spot.findByPk(spotId))) {
            return res.status(404).json({ message: "Spot couldn't be found" });
        }

        const spot = await Spot.findAll({
            where: { id: spotId },
            include: [
                { model: SpotImage, attributes: ["id", "url", "preview"] },
                { model: Review, attributes: ["review", "stars"] },
                {
                    model: User,
                    attributes: ["id", "firstName", "lastName"],
                },
            ],
        });

        const formattedSpots = spot.map((spot) => {
            const reviews = spot.dataValues.Reviews;
            const spotRatings = reviews.map((reviewStars) => reviewStars.stars);
            const avgRating = getAverage(spotRatings);
            const spotReviews = reviews.map(
                (review) => review.dataValues.review
            );
            const countingReviews = countReviews(spotReviews);
            const image = spot.dataValues.SpotImages;
            const imageDetails = image.map((elements) => elements.dataValues);
            const owner = spot.dataValues.User.dataValues;

            return {
                id: spot.id,
                ownerId: spot.ownerId,
                address: spot.address,
                city: spot.city,
                state: spot.state,
                country: spot.country,
                lat: spot.lat,
                lng: spot.lng,
                name: spot.name,
                description: spot.description,
                price: spot.price,
                createdAt: spot.createdAt,
                updatedAt: spot.updatedAt,
                numReviews: countingReviews,
                avgStarRating: avgRating,
                SpotImages: imageDetails,
                Owner: owner,
            };
        });

        for (let element in formattedSpots) {
            if (spotId == formattedSpots[element]) {
                return res.status(200).json(formattedSpots[element]);
            }
        }
    } catch (error) {
        next(error);
    }
});

// Get all reviews by a spot's id
router.get("/:spotId/reviews", async (req, res, next) => {
    try {
        const { spotId } = req.params;

        const spot = await Spot.findByPk(spotId);

        if (!spot) {
            return res.status(404).json({ message: "Spot couldn't be found" });
        }

        const reviews = await Review.findAll({
            where: { spotId },
            include: [
                {
                    model: User,
                    as: "User",
                    attributes: ["id", "firstName", "lastName"],
                },
                { model: ReviewImage, attributes: ["id", "url"] },
            ],
        });

        return res.json({ Reviews: reviews });
    } catch (error) {
        next(error);
    }
});

// Add image to a spot by id
router.post("/:spotId/images", requireAuth, async (req, res, next) => {
    const { spotId } = req.params;
    const { url, preview } = req.body;

    try {
        const spot = await Spot.findByPk(spotId);

        if (!spot) {
            return res.status(404).json({ message: "Spot couldn't be found" });
        }

        if (req.user.id !== spot.ownerId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const newImage = await SpotImage.create({ spotId, url, preview });

        res.status(201).json({
            id: newImage.id,
            url: newImage.url,
            preview: newImage.preview,
        });
    } catch (error) {
        next(error);
    }
});

// Edit a spot
router.put("/:spotId", requireAuth, validateSpot, async (req, res, next) => {
    const spotId = req.params.spotId;
    const findSpotId = await Spot.findByPk(spotId);
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
        if (!findSpotId)
            return res.status(404).json({
                message: "Spot couldn't be found",
            });
        if (req.user.id !== findSpotId.ownerId)
            return res.status(403).json({ message: "Forbidden" });

        const updateSpot = await Spot.findOne({
            where: { id: spotId },
        });
        updateSpot.set({
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

        await updateSpot.save();

        res.json(updateSpot);
    } catch (error) {
        next(error);
    }
});

// Delete a spot
router.delete("/:spotId", requireAuth, async (req, res, next) => {
    const { spotId } = req.params;

    try {
        const spot = await Spot.findByPk(spotId);

        if (!spot) {
            return res.status(404).json({ message: "Spot couldn't be found" });
        }

        if (req.user.id !== spot.ownerId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await spot.destroy();

        res.json({ message: "Successfully deleted" });
    } catch (error) {
        next(error);
    }
});

// Create a review, review from current user already exists for the spot
router.post(
    "/:spotId/reviews",
    requireAuth,
    validateReview,
    async (req, res, next) => {
        const { review, stars } = req.body;
        const userId = req.user.id;
        const { spotId } = req.params;

        const spot = await Spot.findByPk(spotId);
        if (!spot) {
            return res.status(404).json({ message: "Spot couldn't be found" });
        }

        const existingReview = await Review.findOne({
            where: { spotId, userId },
        });
        if (existingReview) {
            return res
                .status(500)
                .json({ message: "User already has a review for this spot" });
        }

        try {
            const newReview = await Review.create({
                userId,
                spotId,
                review,
                stars,
            });

            return res.status(201).json(newReview);
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;

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

function getAverage(arr) {
    if (arr.length === 0) {
        return null;
    }

    const sum = arr.reduce((acc, val) => acc + val, 0);
    const average = sum / arr.length;
    return Number.parseFloat(average).toFixed(1);
}

function countReviews(arr) {
    let count = 0;
    let i = 0;

    while (i < arr.length) {
        i++;
        count++;
    }
    return count;
}

// // Get all spots
// router.get("/", async (req, res, next) => {
//     try {
//         const { city, minPrice, maxPrice, page = 1, size = 10 } = req.query;
//         const limit = parseInt(size, 10) || 10;
//         const offset = (parseInt(page, 10) - 1) * limit;

//         let where = {};
//         if (city) where.city = city;
//         if (minPrice || maxPrice) {
//             where.price = {};
//             if (minPrice) where.price[Sequelize.Op.gte] = minPrice;
//             if (maxPrice) where.price[Sequelize.Op.lte] = maxPrice;
//         }

//         const spots = await Spot.findAll({
//             where,
//             include: [
//                 {
//                     model: SpotImage,
//                     attributes: ["url", "preview"],
//                     where: { preview: true },
//                     required: false,
//                 },
//                 {
//                     model: Review,
//                     attributes: [],
//                 },
//             ],
//             attributes: {
//                 include: [
//                     [
//                         Sequelize.fn("AVG", Sequelize.col("Reviews.stars")),
//                         "avgRating",
//                     ],
//                 ],
//             },
//             group: ["Spot.id", "SpotImages.url", "SpotImages.preview"],
//             limit,
//             offset,
//         });

//         const formattedSpots = spots.map((spot) => {
//             const previewImage = spot.SpotImages[0]
//                 ? spot.SpotImages[0].url
//                 : null;
//             return {
//                 id: spot.id,
//                 ownerId: spot.ownerId,
//                 address: spot.address,
//                 city: spot.city,
//                 state: spot.state,
//                 country: spot.country,
//                 lat: spot.lat,
//                 lng: spot.lng,
//                 name: spot.name,
//                 description: spot.description,
//                 price: spot.price,
//                 createdAt: spot.createdAt,
//                 updatedAt: spot.updatedAt,
//                 avgRating: parseFloat(spot.get("avgRating")) || null,
//                 previewImage,
//             };
//         });

//         res.status(200).json(formattedSpots);
//     } catch (error) {
//         res.status(400).json({ message: "Error retrieving spots" });
//     }
// });

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

        const formattedSpots = spots.map((spot) => {
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
                avgStarRating: avgRating,
                SpotImages: imageDetails,
                Owner: owner,
            };
        });

        for (let element in newFormat) {
            if (spotId == newFormat[element]) {
                return res.status(200).json(newFormat[element]);
            }
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;

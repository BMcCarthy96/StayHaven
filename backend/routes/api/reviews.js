const express = require("express");
const router = express.Router();
const {
    Spot,
    SpotImage,
    Review,
    ReviewImage,
    User,
} = require("../../db/models");
const { Model, json } = require("sequelize");
const { requireAuth } = require("../../utils/auth");
const { parse } = require("dotenv");
const review = require("../../db/models/review");

const validateReview = (req, res, next) => {
    const { review, stars } = req.body;
    const errors = {};
    if (!review) errors.review = "Review text is required";
    if (!stars || stars < 1 || stars > 5)
        errors.stars = "Stars must be an interger from 1 to 5";

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            message: "Validation error",
            errors: errors,
        });
    }
    next();
};

// Get all reviews of the current user
router.get("/current", requireAuth, async (req, res, next) => {
    const currentId = req.user.dataValues.id;

    const reviews = await Review.findAll({
        where: { userId: currentId },
        include: [
            {
                model: User,
                as: "User",
                attributes: ["id", "firstName", "lastName"],
            },
            {
                model: Spot,
                as: "Spot",
                include: [
                    {
                        model: SpotImage,
                        attributes: ["url"],
                        where: { preview: true },
                        required: false,
                    },
                ],
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
                    "price",
                ],
            },
            { model: ReviewImage, attributes: ["id", "url"] },
        ],
    });

    const newFormat = reviews.map((reviewElements) => {
        const review = reviewElements.dataValues;
        const userInfo = reviewElements.dataValues.User.dataValues;
        const spotInfo = reviewElements.dataValues.Spot.dataValues;
        const previewImageDetails = reviewElements.dataValues.ReviewImages.map(
            (elements) => elements.dataValues.url
        );
        const reviewInfo = reviewElements.dataValues.ReviewImages.map(
            (elements) => elements.dataValues
        );

        previewImageDetails.length > 0
            ? (spotInfo.previewImage = previewImageDetails[0])
            : null;

        return {
            id: review.id,
            userId: review.userId,
            spotId: review.spotId,
            review: review.review,
            stars: review.stars,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
            User: userInfo,
            Spot: {
                id: review.Spot.id,
                ownerId: review.Spot.ownerId,
                address: reviewSpot.address,
                city: review.Spot.city,
                state: review.Spot.state,
                country: review.Spot.country,
                lat: review.Spot.lat,
                lng: review.Spot.lng,
                name: review.Spot.name,
                price: review.Spot.price,
                previewImage:
                    review.Spot.SpotImages.length > 0
                        ? review.Spot.SpotImage[0].url
                        : null,
            },
            ReviewImages: reviewInfo,
        };
    });

    res.json({ Reviews: newFormat });
});

// // Get all reviews by a spot's id
// router.get("/spots/:spotId/reviews", async (req, res) => {
//     try {
//         const reviews = await Review.findAll({
//             where: { spotId: req.params.spotId },
//         });
//         res.status(200).json(reviews);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Create a review for a spot based on spots id
// router.post("/spots/:spotId/reviews", requireAuth, async (req, res) => {
//     try {
//         const { content, stars } = req.body; // Removed userId from body; obtained from req.user
//         const spot = await Spot.findByPk(req.params.spotId);

//         // Error response: Couldn't find a Spot with the specified id
//         if (!spot) {
//             return res.status(404).json({
//                 message: "Spot couldn't be found",
//                 statusCode: 404,
//             });
//         }

//         // Error response: Review from the current user already exists for the Spot
//         const existingReview = await Review.findOne({
//             where: {
//                 spotId: spot.id,
//                 userId: req.user.id,
//             },
//         });

//         if (existingReview) {
//             return res.status(403).json({
//                 message:
//                     "Review from the current user already exists for the Spot",
//                 statusCode: 403,
//             });
//         }

//         // Validate stars to be between 1 and 5
//         if (stars < 1 || stars > 5) {
//             return res.status(400).json({
//                 message: "Stars must be an integer from 1 to 5",
//                 statusCode: 400,
//             });
//         }

//         const newReview = await Review.create({
//             content,
//             stars,
//             spotId: spot.id,
//             userId: req.user.id,
//         });

//         res.status(201).json(newReview);
//     } catch (error) {
//         res.status(500).json({
//             message: "Error creating review",
//             error: error.message,
//         });
//     }
// });

// Edit a review
router.put(
    "/:reviewId",
    requireAuth,
    validateReview,
    async (req, res, next) => {
        const { reviewId } = req.params;
        const { review, stars } = req.body;

        try {
            const findingReview = await Review.findByPk(reviewId);
            if (!findingReview)
                return res
                    .status(404)
                    .json({ message: "Review couldn't be found" });

            if (req.user.id !== findingReview.userId)
                return res.status(403).json({ message: "Forbidden" });

            const updateReview = await Review.findOne({
                where: { id: reviewId },
            });
            updateReview.set({ review, stars });

            await updateReview.save();
            res.json(updateReview);
        } catch (error) {
            next(error);
        }
    }
);

// Add an image to a review based on the review's id
router.post("/:reviewId/images", requireAuth, async (req, res, next) => {
    const reviewId = req.params.reviewId;
    const { url } = req.body;

    try {
        const review = await Review.findOne({
            where: { id: reviewId },
        });

        if (!review) {
            return res
                .status(404)
                .json({ message: "Review couldn't be found" });
        }

        if (req.user.id !== review.userId)
            return res.status(403).json({ message: "Forbidden" });

        const newImage = await ReviewImage.createReviewImage({ url });

        const limitedImage = await ReviewImage.findByPk(newImage.id, {
            attributes: ["id", "url"],
        });

        res.status(201).json(limitedImage);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// Delete a review
router.delete("/:reviewId", requireAuth, async (req, res, next) => {
    try {
        const reviewId = req.params.reviewId;
        const review = await Review.findByPk(reviewId);

        if (!review) {
            return res
                .status(404)
                .json({ message: "Review couldn't be found" });
        }

        // Check if the current user is the owner of the review
        if (review.userId !== req.user.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await review.destroy();
        return res.json({
            message: "Successfully deleted",
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

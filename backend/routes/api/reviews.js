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

    if (!review) {
        errors.review = "Review text is required";
    }

    if (typeof stars !== "number" || stars < 1 || stars > 5) {
        errors.stars = "Stars must be an integer from 1 to 5";
    }

    if (Object.keys(errors).length) {
        return res.status(400).json({
            message: "Validation error",
            errors,
        });
    }

    next();
};

// Get all reviews of the current user
router.get("/current", requireAuth, async (req, res, next) => {
    const currentId = req.user.dataValues.id;

    try {
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
                {
                    model: ReviewImage,
                    attributes: ["id", "url"],
                },
            ],
        });

        const formattedReviews = reviews.map((reviewElement) => {
            const review = reviewElement.dataValues;
            const userInfo = review.User.dataValues;
            const spotInfo = review.Spot.dataValues;

            // Get the preview image if available
            const previewImage = review.ReviewImages.length
                ? review.ReviewImages[0].dataValues.url
                : null;

            // Attach preview image to Spot object if it exists
            spotInfo.previewImage = previewImage;

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
                    id: spotInfo.id,
                    ownerId: spotInfo.ownerId,
                    address: spotInfo.address,
                    city: spotInfo.city,
                    state: spotInfo.state,
                    country: spotInfo.country,
                    lat: spotInfo.lat,
                    lng: spotInfo.lng,
                    name: spotInfo.name,
                    price: spotInfo.price,
                    previewImage: spotInfo.previewImage,
                },
                ReviewImages: review.ReviewImages.map(
                    (image) => image.dataValues
                ),
            };
        });

        res.json({ Reviews: formattedReviews });
    } catch (error) {
        next(error);
    }
});

// Edit a review
router.put(
    "/:reviewId",
    requireAuth,
    validateReview,
    async (req, res, next) => {
        const { reviewId } = req.params;
        const { review, stars } = req.body;

        try {
            const reviewToUpdate = await Review.findByPk(reviewId);

            if (!reviewToUpdate) {
                return res
                    .status(404)
                    .json({ message: "Review couldn't be found" });
            }

            if (req.user.id !== reviewToUpdate.userId) {
                return res.status(403).json({ message: "Forbidden" });
            }

            reviewToUpdate.set({ review, stars });

            await reviewToUpdate.save();

            res.json(reviewToUpdate);
        } catch (error) {
            next(error);
        }
    }
);

// Add an image to a review based on the review's id
router.post("/:reviewId/images", requireAuth, async (req, res, next) => {
    const { reviewId } = req.params;
    const { url } = req.body;

    try {
        const review = await Review.findByPk(reviewId);

        if (!review) {
            return res
                .status(404)
                .json({ message: "Review couldn't be found" });
        }

        if (req.user.id !== review.userId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const newImage = await ReviewImage.create({ reviewId, url });

        const limitedImage = { id: newImage.id, url: newImage.url };

        res.status(201).json(limitedImage);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// Delete a review
router.delete("/:reviewId", requireAuth, async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const { id: userId } = req.user;

        const review = await Review.findByPk(reviewId);

        if (!review) {
            return res
                .status(404)
                .json({ message: "Review couldn't be found" });
        }

        if (review.userId !== userId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await review.destroy();

        return res.status(200).json({ message: "Successfully deleted" });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

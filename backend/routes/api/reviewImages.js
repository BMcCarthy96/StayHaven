const express = require("express");
const router = express.Router();
const {
    Spot,
    SpotImage,
    User,
    ReviewImage,
    Review,
    Booking,
} = require("../../db/models");
const { Model, json } = require("sequelize");
const { requireAuth } = require("../../utils/auth");
const { parse } = require("dotenv");
const review = require("../../db/models/review");

// Delete an image from a review
router.delete("/:imageId", requireAuth, async (req, res, next) => {
    const { id: userId } = req.user;
    const { imageId } = req.params;

    try {
        const reviewImage = await ReviewImage.findOne({
            where: { id: imageId },
        });

        if (!reviewImage) {
            return res
                .status(404)
                .json({ message: "Review image couldn't be found" });
        }

        const review = await Review.findByPk(reviewImage.reviewId);

        if (!review || review.userId !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await reviewImage.destroy();
        res.status(200).json({ message: "Successfully deleted" });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

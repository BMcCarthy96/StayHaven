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

// Delete an image from a spot
router.delete("/:imageId", requireAuth, async (req, res, next) => {
    const spotImage = req.params.imageId;
    let spotId;

    try {
        const findSpotImageId = await SpotImage.findByPk(spotImage);
        if (!findSpotImageId)
            res.status(404).json({
                message: "Spot image couldn't be found",
            });

        spotId = findSpotImageId.spotId;

        const findSpot = await Spot.findAll({
            where: { id: spotId },
        });

        findSpot.forEach((element) => {
            if (req.user.id !== element.ownerId)
                return res.status(403).json({
                    message: "Forbidden",
                });
        });
        await findSpotImageId.destroy();
        res.json({ message: "Successfully deleted" });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

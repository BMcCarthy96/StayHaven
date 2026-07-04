const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../utils/auth");
const { Spot, User, SpotImage, Review } = require("../../db/models");

const calculateAvgStarRating = async (spotId) => {
    const reviews = await Review.findAll({ where: { spotId } });
    const totalStars = reviews.reduce((sum, review) => sum + review.stars, 0);
    return reviews.length
        ? parseFloat((totalStars / reviews.length).toFixed(1))
        : 0;
};

const getPreviewImage = async (spotId) => {
    const image = await SpotImage.findOne({ where: { spotId } });
    return image ? image.url : "No preview image available";
};

// Get current user's wishlist
router.get("/current", requireAuth, async (req, res) => {
    const user = await User.findByPk(req.user.id, {
        include: {
            model: Spot,
            as: "WishlistedSpots",
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
                "bedrooms",
                "bathrooms",
                "beds",
                "guestCapacity",
                "createdAt",
                "updatedAt",
            ],
        },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const spotsWithDetails = await Promise.all(
        user.WishlistedSpots.map(async (spot) => ({
            ...spot.toJSON(),
            avgRating: await calculateAvgStarRating(spot.id),
            previewImage: await getPreviewImage(spot.id),
        }))
    );

    res.json({ Spots: spotsWithDetails });
});

// Add a spot to wishlist
router.post("/:spotId", requireAuth, async (req, res) => {
    const user = await User.findByPk(req.user.id);
    const spot = await Spot.findByPk(req.params.spotId);
    if (!spot) return res.status(404).json({ message: "Spot not found" });

    await user.addWishlistedSpot(spot);
    res.json({ message: "Added to wishlist" });
});

// Remove a spot from wishlist
router.delete("/:spotId", requireAuth, async (req, res) => {
    const user = await User.findByPk(req.user.id);
    const spot = await Spot.findByPk(req.params.spotId);
    if (!spot) return res.status(404).json({ message: "Spot not found" });

    await user.removeWishlistedSpot(spot);
    res.json({ message: "Removed from wishlist" });
});

module.exports = router;

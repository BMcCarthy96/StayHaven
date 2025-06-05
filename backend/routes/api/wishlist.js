const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../utils/auth");
const { Spot, User } = require("../../db/models");

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
                "createdAt",
                "updatedAt",
            ],
        },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ Spots: user.WishlistedSpots });
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

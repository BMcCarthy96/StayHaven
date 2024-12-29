const express = require("express");
const router = express.Router();

const {
    User,
    Spot,
    Review,
    ReviewImage,
    SpotImage,
    Booking,
} = require("../../db/models");
const { requireAuth } = require("../../utils/auth");

// Helper function, retrieves preview image URL
const getPreviewImage = async (spotId) => {
    const image = await SpotImage.findOne({ where: { spotId } });
    return image ? image.url : "No preview image available";
};

// Get all current user's bookings
router.get("/current", requireAuth, async (req, res) => {
    const currentUser = req.user.id;

    const bookings = await Booking.findAll({
        where: { userId: currentUser },
        include: {
            model: Spot,
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
    });

    if (!bookings.length) {
        return res.status(200).json({ message: "No bookings yet" });
    }

    const bookingsWithDetails = await Promise.all(
        bookings.map(async (booking) => {
            const previewImage = await getPreviewImage(booking.Spot.id);
            return {
                ...booking.toJSON(),
                Spot: { ...booking.Spot.toJSON(), previewImage },
            };
        })
    );

    return res.status(200).json({ Bookings: bookingsWithDetails });
});

// Edit a Booking
router.put("/:id", requireAuth, async (req, res) => {
    const userId = req.user.id;
    const bookingId = req.params.id;
    const { startDate, endDate } = req.body;

    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
        return res.status(404).json({ message: "Booking couldn't be found" });
    }

    // Check if the current user is the owner of the booking
    if (booking.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
    }

    // Validate dates
    if (!startDate || !endDate) {
        return res.status(400).json({
            message: "Bad Request",
            errors: {
                startDate: "Start date is required",
                endDate: "End date is required",
            },
        });
    }

    if (new Date(startDate) < new Date()) {
        return res.status(400).json({
            message: "Bad Request",
            errors: { startDate: "Start date cannot be in the past" },
        });
    }

    if (new Date(endDate) <= new Date(startDate)) {
        return res.status(400).json({
            message: "Bad Request",
            errors: { endDate: "End date must be after the start date" },
        });
    }

    // Check if the booking's end date has passed
    if (new Date(booking.endDate) < new Date()) {
        return res
            .status(403)
            .json({ message: "Past bookings can't be modified" });
    }

    // Check for booking conflict
    const existingBooking = await Booking.findOne({
        where: {
            spotId: booking.spotId,
            startDate: { [Op.between]: [startDate, endDate] },
            endDate: { [Op.between]: [startDate, endDate] },
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

    // Update booking with new dates
    booking.startDate = startDate;
    booking.endDate = endDate;
    await booking.save();

    return res.json(booking);
});

// Delete a Booking
router.delete("/:id", requireAuth, async (req, res) => {
    const userId = req.user.id;
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
        return res.status(404).json({ message: "Booking couldn't be found" });
    }

    // Check if the current user is the owner of the booking
    if (booking.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
    }

    // Check if the booking has started (cannot delete past bookings)
    if (new Date(booking.startDate) < new Date()) {
        return res.status(403).json({
            message: "Bookings that have been started can't be deleted",
        });
    }

    await booking.destroy();
    return res.json({ message: "Successfully deleted" });
});

module.exports = router;

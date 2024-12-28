const express = require("express");
const router = express.Router();
const { User, Spot, SpotImage, Booking } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");
const { handleValidationErrors } = require("../../utils/validation");
const { check } = require("express-validator");

// Helper function: Retrieve preview image URL
const getPreviewImage = async (spotId) => {
    const image = await SpotImage.findOne({ where: { spotId } });
    return image ? image.url : null;
};

// Helper function: Check if a date is in the past
const isDateInThePast = (date) => new Date(date) < new Date();

// Helper function: Check for overlapping booking dates
const hasBookingConflict = async (spotId, startDate, endDate) => {
    return await Booking.findOne({
        where: {
            spotId,
            [Op.or]: [
                { startDate: { [Op.between]: [startDate, endDate] } },
                { endDate: { [Op.between]: [startDate, endDate] } },
                {
                    startDate: { [Op.lte]: startDate },
                    endDate: { [Op.gte]: endDate },
                },
            ],
        },
    });
};

// Get all of the Current User's Bookings
router.get("/current", requireAuth, async (req, res) => {
    const userId = req.user.id;

    const bookings = await Booking.findAll({
        where: { userId },
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
            const spot = booking.Spot;
            const previewImage = await getPreviewImage(spot.id);
            return {
                ...booking.toJSON(),
                Spot: {
                    ...spot.toJSON(),
                    previewImage: previewImage || "No preview image available",
                },
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

    if (booking.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
    }

    if (isDateInThePast(startDate)) {
        return res.status(400).json({
            message: "Bad Request",
            errors: { startDate: "Start date cannot be in the past" },
        });
    }

    if (new Date(endDate) <= new Date(startDate)) {
        return res.status(400).json({
            message: "Bad Request",
            errors: { endDate: "End date cannot be on or before start date" },
        });
    }

    if (new Date(booking.endDate) < new Date()) {
        return res
            .status(403)
            .json({ message: "Past bookings can't be modified" });
    }

    const conflict = await hasBookingConflict(
        booking.spotId,
        startDate,
        endDate
    );
    if (conflict) {
        return res.status(403).json({
            message:
                "Sorry, this spot is already booked for the specified dates",
            errors: {
                startDate: "Start date conflicts with an existing booking",
                endDate: "End date conflicts with an existing booking",
            },
        });
    }

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

    if (booking.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
    }

    if (new Date(booking.startDate) < new Date()) {
        return res
            .status(403)
            .json({
                message: "Bookings that have been started can't be deleted",
            });
    }

    await booking.destroy();
    return res.json({ message: "Successfully deleted" });
});

module.exports = router;

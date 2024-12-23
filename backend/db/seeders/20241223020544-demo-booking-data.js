"use strict";
const { Booking } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
    options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const demoBookings = [
            {
                spotId: 1,
                userId: 1,
                startDate: "05/01/2025",
                endDate: "05/07/2025",
            },
            {
                spotId: 2,
                userId: 2,
                startDate: "07/20/2025",
                endDate: "07/27/2025",
            },
            {
                spotId: 3,
                userId: 3,
                startDate: "12/15/2025",
                endDate: "12/22/2025",
            },
            {
                spotId: 4,
                userId: 4,
                startDate: "09/10/2025",
                endDate: "09/17/2025",
            },
            {
                spotId: 5,
                userId: 5,
                startDate: "01/05/2025",
                endDate: "01/12/2025",
            },
        ];

        await Booking.bulkCreate(demoBookings, { validate: true, ...options });
    },

    async down(queryInterface, Sequelize) {
        options.tableName = "Bookings";
        const Op = Sequelize.Op;

        return queryInterface.bulkDelete(options, {
            startDate: {
                [Op.in]: [
                    "05/01/2025",
                    "07/20/2025",
                    "12/15/2025",
                    "09/10/2025",
                    "01/05/2025",
                ],
            },
        });
    },
};

"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
    options.schema = process.env.SCHEMA;
}

// Dates are computed relative to seed-run time (not hardcoded) so the demo
// always shows a realistic mix of upcoming and past trips, no matter when
// this seeder actually runs.
const daysFromNow = (n) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + n);
    return d;
};

// { spotId, userId, startOffset, endOffset } — userId is never the spot's
// own owner (matches the "can't book your own spot" rule enforced by the API).
const BOOKINGS = [
    { spotId: 1, userId: 2, start: 14, end: 19 },
    { spotId: 3, userId: 4, start: 30, end: 35 },
    { spotId: 5, userId: 1, start: -20, end: -15 },
    { spotId: 7, userId: 5, start: 60, end: 65 },
    { spotId: 9, userId: 3, start: -45, end: -40 },
    { spotId: 10, userId: 2, start: 90, end: 97 },
    { spotId: 12, userId: 4, start: -10, end: -5 },
    { spotId: 14, userId: 1, start: 120, end: 125 },
    { spotId: 16, userId: 5, start: -60, end: -53 },
    { spotId: 18, userId: 2, start: 45, end: 50 },
    { spotId: 20, userId: 2, start: -30, end: -25 },
    { spotId: 21, userId: 4, start: 200, end: 207 },
    { spotId: 23, userId: 1, start: -5, end: -1 },
    { spotId: 25, userId: 1, start: 15, end: 20 },
    { spotId: 26, userId: 3, start: 75, end: 80 },
    { spotId: 2, userId: 4, start: -100, end: -93 },
];

module.exports = {
    async up(queryInterface) {
        options.tableName = "Bookings";
        const now = new Date();
        await queryInterface.bulkInsert(
            options,
            BOOKINGS.map((b) => ({
                spotId: b.spotId,
                userId: b.userId,
                startDate: daysFromNow(b.start),
                endDate: daysFromNow(b.end),
                createdAt: now,
                updatedAt: now,
            })),
            { validate: true }
        );
    },

    async down(queryInterface) {
        options.tableName = "Bookings";
        await queryInterface.bulkDelete(options, null, {});
    },
};

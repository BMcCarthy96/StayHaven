"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
    options.schema = process.env.SCHEMA;
}

const toUrl = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

// reviewId matches insertion order in demo-review.js (1-36). Each ID below
// was verified with a live HTTP request before being committed.
const REVIEW_IMAGES = [
    { reviewId: 1, id: "1738168246881-40f35f8aba0a" },
    { reviewId: 5, id: "1631941150945-837cb81fc7e2" },
    { reviewId: 8, id: "1592990379716-aec6e89a6a69" },
    { reviewId: 15, id: "1613977257365-aaae5a9817ff" },
    { reviewId: 16, id: "1544984243-ec57ea16fe25" },
    { reviewId: 21, id: "1680962884378-b69a04b9969c" },
    { reviewId: 25, id: "1706808849777-96e0d7be3bb7" },
    { reviewId: 28, id: "1613977257592-4871e5fcd7c4" },
    { reviewId: 33, id: "1591474200742-8e512e6f98f8" },
    { reviewId: 35, id: "1738168279272-c08d6dd22002" },
];

module.exports = {
    async up(queryInterface) {
        options.tableName = "ReviewImages";
        await queryInterface.bulkInsert(
            options,
            REVIEW_IMAGES.map((img) => ({
                reviewId: img.reviewId,
                url: toUrl(img.id),
            })),
            { validate: true }
        );
    },

    async down(queryInterface) {
        options.tableName = "ReviewImages";
        await queryInterface.bulkDelete(options, null, {});
    },
};

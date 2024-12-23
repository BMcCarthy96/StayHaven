"use strict";
const { Review } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
    options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const demoReviews = [
            {
                spotId: 1, // Empire State Building, New York
                userId: 1,
                review: "The Empire State Building offers an amazing view of New York City. Highly recommend the observation deck!",
                stars: 5,
            },
            {
                spotId: 2, // Eiffel Tower, Paris
                userId: 2,
                review: "Visiting the Eiffel Tower at night is a magical experience, especially when the lights twinkle. A must-see in Paris.",
                stars: 5,
            },
            {
                spotId: 3, // Great Wall of China, Beijing
                userId: 3,
                review: "The Great Wall is an incredible feat of engineering. It's a long walk but the views are worth every step.",
                stars: 4,
            },
            {
                spotId: 4, // Taj Mahal, Agra
                userId: 4,
                review: "The Taj Mahal is even more beautiful in person than in photos. The intricate design and the history behind it are remarkable.",
                stars: 5,
            },
            {
                spotId: 5, // Colosseum, Rome
                userId: 5,
                review: "The Colosseum is a fantastic piece of history. It's amazing to think about how it was used in ancient times for gladiator games.",
                stars: 4,
            },
        ];

        await Review.bulkCreate(demoReviews, { validate: true, ...options });
    },

    async down(queryInterface, Sequelize) {
        options.tableName = "Reviews";
        const Op = Sequelize.Op;

        return queryInterface.bulkDelete(options, {
            spotId: {
                [Op.in]: [1, 2, 3, 4, 5],
            },
        });
    },
};

"use strict";
const { SpotImage } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
    options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await SpotImage.bulkCreate(
            [
                {
                    spotId: 1, // Empire State Building
                    url: "https://shorturl.at/voaJD",
                    preview: true,
                },
                {
                    spotId: 2, // Eiffel Tower
                    url: "https://shorturl.at/ljkCc",
                    preview: false,
                },
                {
                    spotId: 3, // Great Wall of China
                    url: "https://shorturl.at/Y0iam",
                    preview: true,
                },
                {
                    spotId: 4, // Taj Mahal
                    url: "https://h2.gifposter.com/bingImages/TajMahalReflection_1920x1080.jpg",
                    preview: false,
                },
                {
                    spotId: 5, // Colosseum
                    url: "https://cdn.mos.cms.futurecdn.net/BiNbcY5fXy9Lra47jqHKGK.jpg",
                    preview: true,
                },
            ],
            { validate: true, ...options }
        );
    },

    async down(queryInterface, Sequelize) {
        options.tableName = "SpotImages";
        const Op = Sequelize.Op;
        return queryInterface.bulkDelete(options, {
            spotId: {
                [Op.in]: [1, 2, 3, 4, 5],
            },
        });
    },
};

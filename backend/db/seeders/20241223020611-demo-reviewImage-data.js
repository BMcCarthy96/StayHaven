"use strict";
const { ReviewImage } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
    options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await ReviewImage.bulkCreate(
            [
                {
                    reviewId: 1, // Review for Empire State Building
                    url: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Empire_State_Building_from_the_33rd_floor.JPG",
                },
                {
                    reviewId: 2, // Review for Eiffel Tower
                    url: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Eiffel_Tower_from_the_Trocad%C3%A9ro_%28cropped%29.jpg",
                },
                {
                    reviewId: 3, // Review for Great Wall of China
                    url: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Great_Wall_of_China_July_2006.jpg",
                },
                {
                    reviewId: 4, // Review for Taj Mahal
                    url: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Taj_Mahal%2C_Agra%2C_India.jpg",
                },
                {
                    reviewId: 5, // Review for Colosseum
                    url: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Colosseum_in_Rome_-_April_2007.jpg",
                },
            ],
            { validate: true, ...options }
        );
    },

    async down(queryInterface, Sequelize) {
        options.tableName = "ReviewImages";
        const Op = Sequelize.Op;
        return queryInterface.bulkDelete(options, {
            reviewId: {
                [Op.in]: [1, 2, 3, 4, 5],
            },
        });
    },
};

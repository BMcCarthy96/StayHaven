"use strict";
const { Spot } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
    options.schema = process.env.SCHEMA; // Define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const demoSpots = [
            {
                ownerId: 1,
                address: "Empire State Building, 20 W 34th St",
                city: "New York",
                state: "NY",
                country: "USA",
                lat: 40.748817,
                lng: -73.985428,
                name: "Empire State Building",
                price: 50.0,
                description: "Iconic skyscraper in New York City.",
            },
            {
                ownerId: 2,
                address: "Eiffel Tower, Champ de Mars",
                city: "Paris",
                state: "Île-de-France",
                country: "France",
                lat: 48.858844,
                lng: 2.29435,
                name: "Eiffel Tower",
                price: 30.0,
                description: "A wrought-iron lattice tower in Paris, France.",
            },
            {
                ownerId: 3,
                address: "Great Wall of China, Huairou",
                city: "Beijing",
                state: "Beijing",
                country: "China",
                lat: 40.431907,
                lng: 116.570374,
                name: "Great Wall of China",
                price: 15.0,
                description: "Historic fortification built to protect China.",
            },
            {
                ownerId: 4,
                address: "Taj Mahal, Dharmapuri",
                city: "Agra",
                state: "Uttar Pradesh",
                country: "India",
                lat: 27.175144,
                lng: 78.042142,
                name: "Taj Mahal",
                price: 25.0,
                description: "Famous white marble mausoleum in India.",
            },
            {
                ownerId: 5,
                address: "Colosseum, Piazza del Colosseo",
                city: "Rome",
                state: "Lazio",
                country: "Italy",
                lat: 41.89021,
                lng: 12.492231,
                name: "Colosseum",
                price: 18.0,
                description: "Ancient amphitheater in the heart of Rome.",
            },
        ];

        await Spot.bulkCreate(demoSpots, { validate: true, ...options });
    },

    async down(queryInterface, Sequelize) {
        options.tableName = "Spots";
        const Op = Sequelize.Op;

        return queryInterface.bulkDelete(options, {
            lat: {
                [Op.in]: [40.748817, 48.858844, 40.431907, 27.175144, 41.89021],
            },
        });
    },
};

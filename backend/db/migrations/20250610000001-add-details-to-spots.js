"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
    options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const table = { tableName: "Spots", ...options };
        await queryInterface.addColumn(table, "bedrooms", {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1,
        });
        await queryInterface.addColumn(table, "bathrooms", {
            type: Sequelize.DECIMAL(3, 1),
            allowNull: false,
            defaultValue: 1,
        });
        await queryInterface.addColumn(table, "beds", {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1,
        });
        await queryInterface.addColumn(table, "guestCapacity", {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 2,
        });
        await queryInterface.addColumn(table, "amenities", {
            type: Sequelize.JSON,
            allowNull: false,
            defaultValue: [],
        });
    },

    async down(queryInterface) {
        const table = { tableName: "Spots", ...options };
        await queryInterface.removeColumn(table, "bedrooms");
        await queryInterface.removeColumn(table, "bathrooms");
        await queryInterface.removeColumn(table, "beds");
        await queryInterface.removeColumn(table, "guestCapacity");
        await queryInterface.removeColumn(table, "amenities");
    },
};

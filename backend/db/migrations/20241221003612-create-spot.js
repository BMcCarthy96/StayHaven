"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
    options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            "Spots",
            {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                },
                ownerId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                address: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                city: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                state: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                country: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                lat: {
                    type: Sequelize.DECIMAL,
                    unique: false,
                },
                lng: {
                    type: Sequelize.DECIMAL,
                    unique: false,
                },
                name: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                description: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                price: {
                    type: Sequelize.DECIMAL,
                    allowNull: false,
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
                },
            },
            options
        );
    },

    async down(queryInterface, Sequelize) {
        options.tableName = "Spots";
        await queryInterface.dropTable(options);
    },
};

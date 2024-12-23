"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
    options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            "Reviews",
            {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                },
                spotId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                userId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                review: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                stars: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
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
        options.tableName = "Reviews";
        await queryInterface.dropTable(options);
    },
};

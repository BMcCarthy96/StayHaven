"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
    options.schema = process.env.SCHEMA; // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            "Users",
            {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                },
                firstName: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                lastName: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                username: {
                    type: Sequelize.STRING(30),
                    allowNull: false,
                    unique: true,
                },
                hashedPassword: {
                    type: Sequelize.STRING.BINARY,
                    allowNull: false,
                },
                email: {
                    type: Sequelize.STRING(100),
                    allowNull: false,
                    unique: true,
                },
                bio: {
                    type: Sequelize.TEXT,
                    allowNull: true,
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
                },
            },
            options
        );
    },
    async down(queryInterface, Sequelize) {
        options.tableName = "Users";
        return queryInterface.dropTable(options);
    },
};

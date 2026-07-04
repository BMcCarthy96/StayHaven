"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
    options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const table = { tableName: "Users", ...options };
        await queryInterface.addColumn(table, "avatarUrl", {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },

    async down(queryInterface) {
        const table = { tableName: "Users", ...options };
        await queryInterface.removeColumn(table, "avatarUrl");
    },
};

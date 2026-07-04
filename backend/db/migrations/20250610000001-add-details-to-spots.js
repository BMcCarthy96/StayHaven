"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("Spots", "bedrooms", {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1,
        });
        await queryInterface.addColumn("Spots", "bathrooms", {
            type: Sequelize.DECIMAL(3, 1),
            allowNull: false,
            defaultValue: 1,
        });
        await queryInterface.addColumn("Spots", "beds", {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1,
        });
        await queryInterface.addColumn("Spots", "guestCapacity", {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 2,
        });
        await queryInterface.addColumn("Spots", "amenities", {
            type: Sequelize.JSON,
            allowNull: false,
            defaultValue: [],
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn("Spots", "bedrooms");
        await queryInterface.removeColumn("Spots", "bathrooms");
        await queryInterface.removeColumn("Spots", "beds");
        await queryInterface.removeColumn("Spots", "guestCapacity");
        await queryInterface.removeColumn("Spots", "amenities");
    },
};

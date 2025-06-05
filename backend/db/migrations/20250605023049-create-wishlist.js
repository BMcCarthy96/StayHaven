"use strict";
let options = {};
if (process.env.NODE_ENV === "production") {
    options.schema = process.env.SCHEMA;
}

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            "Wishlists",
            {
                userId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: { model: "Users", key: "id" },
                    onDelete: "CASCADE",
                    primaryKey: true,
                },
                spotId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: { model: "Spots", key: "id" },
                    onDelete: "CASCADE",
                    primaryKey: true,
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
        options.tableName = "Wishlists";
        await queryInterface.dropTable(options);
    },
};

"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Booking extends Model {
        static associate(models) {
            Booking.belongsTo(models.Spot, { foreignKey: "spotId" });
            Booking.belongsTo(models.User, { foreignKey: "userId" });
        }
    }
    Booking.init(
        {
            spotId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            startDate: {
                type: DataTypes.DATE,
                allowNull: false,
                get() {
                    const date = this.getDataValue("startDate");
                    return date ? date.toISOString().split("T")[0] : null; // Formats to YYYY-MM-DD
                },
                set(value) {
                    const date = new Date(value + "T00:00:00.000Z"); // Saves the date in UTC
                    this.setDataValue("startDate", date);
                },
            },
            endDate: {
                type: DataTypes.DATE,
                allowNull: false,
                get() {
                    const date = this.getDataValue("endDate");
                    return date ? date.toISOString().split("T")[0] : null; // Formats to YYYY-MM-DD
                },
                set(value) {
                    const date = new Date(value + "T00:00:00.000Z"); // Saves the date in UTC
                    this.setDataValue("endDate", date);
                },
            },
            createdAt: {
                type: DataTypes.DATE,
            },
            updatedAt: {
                type: DataTypes.DATE,
            },
        },
        {
            sequelize,
            modelName: "Booking",
            tableName: "Bookings",
        }
    );
    return Booking;
};

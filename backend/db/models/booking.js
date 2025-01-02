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
                    const value = this.getDataValue("startDate");
                    return value ? formatDate(value) : null;
                },
            },
            endDate: {
                type: DataTypes.DATE,
                allowNull: false,
                get() {
                    const value = this.getDataValue("endDate");
                    return value ? formatDate(value) : null;
                },
            },
            createdAt: {
                type: DataTypes.DATE,
                get() {
                    const value = this.getDataValue("createdAt");
                    return value ? formatDate(value, true) : null;
                },
            },
            updatedAt: {
                type: DataTypes.DATE,
                get() {
                    const value = this.getDataValue("updatedAt");
                    return value ? formatDate(value, true) : null;
                },
            },
        },
        {
            sequelize,
            modelName: "Booking",
            tableName: "Bookings",
        }
    );

    // Helper function to format date into YYYY-MM-DD (startDate, endDate)
    // or YYYY-MM-DD HH:mm:ss (createdAt, updatedAt)
    const formatDate = (date, includeTime = false) => {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            console.log(`Invalid date value: ${date}`);
            return null; // Handle invalid dates
        }
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");

        if (includeTime) {
            const hours = String(d.getHours()).padStart(2, "0");
            const minutes = String(d.getMinutes()).padStart(2, "0");
            const seconds = String(d.getSeconds()).padStart(2, "0");
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }

        return `${year}-${month}-${day}`; // YYYY-MM-DD format for startDate and endDate
    };

    return Booking;
};

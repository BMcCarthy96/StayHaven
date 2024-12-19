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
                references: {
                    model: "Spots",
                    key: "id",
                },
                onDelete: "CASCADE",
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Users",
                    key: "id",
                },
                onDelete: "CASCADE",
            },
            startDate: {
                type: DataTypes.DATE,
                allowNull: false,
                validate: {
                    validStartDate(value) {
                        console.log(this.endDate);
                        if (!this.endDate) {
                            throw new Error(
                                "End date is required to validate start date."
                            );
                        }
                        const unixStartDate = Math.floor(
                            new Date(value).getTime() / 1000
                        );
                        const unixEndDate = Math.floor(
                            new Date(this.endDate).getTime() / 1000
                        );
                        if (unixStartDate > unixEndDate) {
                            throw new Error(
                                "Start date must be before the end date."
                            );
                        }
                    },
                },
            },
            endDate: {
                type: DataTypes.DATE,
                allowNull: false,
                validate: {
                    validEndDate(value) {
                        if (!this.startDate) {
                            throw new Error(
                                "The start date is required to validate the end date."
                            );
                        }
                        const unixEndDate = Math.floor(
                            new Date(value).getTime() / 1000
                        );
                        const unixStartDate = Math.floor(
                            new Date(this.startDate).getTime() / 1000
                        );
                        if (unixStartDate > unixEndDate) {
                            throw new Error(
                                "End date must be after the start date."
                            );
                        }
                    },
                },
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: "Booking",
        }
    );
    return Booking;
};

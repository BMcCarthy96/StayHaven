"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Review extends Model {
        static associate(models) {
            Review.belongsTo(models.User, {
                foreignKey: "userId",
                as: "User",
            });
            Review.belongsTo(models.Spot, {
                foreignKey: "spotId",
                as: "User",
            });
            Review.hasMany(models.ReviewImage, {
                foreignKey: "reviewId",
                onDelete: "CASCADE",
            });
        }
    }

    Review.init(
        {
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Users",
                    key: "id",
                },
                onDelete: "CASCADE",
            },
            spotId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Spots",
                    key: "id",
                },
                onDelete: "CASCADE",
            },
            stars: {
                type: DataTypes.INTEGER,
                validate: {
                    len: [1, 1],
                    isInt: true,
                    notEmpty: true,
                },
            },
            review: {
                type: DataTypes.STRING,
                validate: {
                    notEmpty: true,
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
            modelName: "Review",
        }
    );

    return Review;
};

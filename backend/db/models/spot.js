"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Spot extends Model {
        static associate(models) {
            Spot.hasMany(models.Review, {
                foreignKey: "spotId",
                onDelete: "CASCADE",
                hooks: true,
            });
            Spot.belongsTo(models.User, {
                foreignKey: "ownerId",
            });
            Spot.hasMany(models.Booking, {
                foreignKey: "spotId",
                onDelete: "CASCADE",
                hooks: true,
            });
            Spot.hasMany(models.SpotImage, {
                foreignKey: "spotId",
                onDelete: "CASCADE",
                hooks: true,
            });
        }
    }

    Spot.init(
        {
            ownerId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Users",
                    key: "id",
                },
                validate: {
                    isInt: true,
                },
                onDelete: "CASCADE",
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: [1, 50],
                },
            },
            description: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                validate: {
                    min: 1,
                },
            },
            address: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            city: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    is: /^[a-zA-Z_ ]+$/i,
                },
            },
            state: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            country: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            lat: {
                type: DataTypes.DECIMAL(10, 7),
                unique: false,
                validate: {
                    min: -90,
                    max: 90,
                },
            },
            lng: {
                type: DataTypes.DECIMAL(10, 7),
                unique: false,
                validate: {
                    min: -180,
                    max: 180,
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
            modelName: "Spot",
            tableName: "Spots",
        }
    );

    return Spot;
};

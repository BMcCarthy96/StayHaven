"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Wishlist extends Model {
        static associate(models) {
            // associations can be defined here if needed
        }
    }
    Wishlist.init(
        {
            userId: DataTypes.INTEGER,
            spotId: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: "Wishlist",
            tableName: "Wishlists",
        }
    );
    return Wishlist;
};

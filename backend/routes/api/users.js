const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

const { setTokenCookie, requireAuth } = require("../../utils/auth");
const { User } = require("../../db/models");

const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const validateSignup = [
    check("firstName")
        .exists({ checkFalsy: true })
        .withMessage("First Name is required."),
    check("lastName")
        .exists({ checkFalsy: true })
        .withMessage("Last Name is required."),
    check("email")
        .exists({ checkFalsy: true })
        .isEmail()
        .withMessage("Please provide a valid email."),
    check("username")
        .exists({ checkFalsy: true })
        .isLength({ min: 4 })
        .withMessage("Please provide a username with at least 4 characters."),
    check("username")
        .not()
        .isEmail()
        .withMessage("Username cannot be an email."),
    check("password")
        .exists({ checkFalsy: true })
        .isLength({ min: 6 })
        .withMessage("Password must be 6 characters or more."),
    handleValidationErrors,
];

// Sign Up
router.post("/", validateSignup, async (req, res, next) => {
    const { firstName, lastName, email, password, username } = req.body;

    // Check if username or email already exists
    const existingUser = await User.findOne({
        where: { [Op.or]: [{ username }, { email }] },
    });
    if (existingUser) {
        return next({
            status: 500,
            message: "User already exists",
            errors: {
                username: "User with that username already exists",
                email: "User with that email already exists",
            },
        });
    }

    const user = await User.create({
        firstName,
        lastName,
        email,
        username,
        hashedPassword: bcrypt.hashSync(password),
    });

    const safeUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
    };

    await setTokenCookie(res, safeUser);

    return res.status(201).json({ user: safeUser });
});

// Update user profile
router.put("/profile", requireAuth, async (req, res) => {
    const { firstName, lastName, email, bio, avatarUrl } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.firstName = firstName;
    user.lastName = lastName;
    user.bio = bio;
    if (email) user.email = email;
    if (avatarUrl !== undefined && avatarUrl.trim() !== "") {
        user.avatarUrl = avatarUrl;
    }

    await user.save();

    const safeUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        bio: user.bio,
        avatarUrl: user.avatarUrl || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };

    return res.json({ user: safeUser });
});

module.exports = router;

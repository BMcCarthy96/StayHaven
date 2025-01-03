const express = require("express");
const router = express.Router();
const apiRouter = require("./api");

router.use("/api", apiRouter);

// Root route for '/'
router.get("/", (req, res) => {
    res.send("Welcome to the root of the API");
});

// Add CSRF token route
router.get("/csrf/restore", (req, res) => {
    const csrfToken = req.csrfToken();
    res.cookie("XSRF-TOKEN", csrfToken);
    res.status(200).json({ "XSRF-Token": csrfToken });
});

module.exports = router;

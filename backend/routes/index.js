const express = require("express");
const router = express.Router();
const apiRouter = require("./api");

router.use("/api", apiRouter);

// Root route for '/'
router.get("/", (req, res) => {
    res.send("Welcome to the root of the API");
});

module.exports = router;

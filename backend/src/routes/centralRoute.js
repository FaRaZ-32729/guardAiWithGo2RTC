const express = require("express");
const authRoute = require("./authRoute")
const userRoute = require("./userRoute")
const camRoute = require("./cameraRoute")
const challanRoute = require("./challanRoute")

const router = express.Router();


router.use("/auth", authRoute);
router.use("/student", userRoute);
router.use("/camera", camRoute);
router.use("/challan", challanRoute);


module.exports = router;
const express = require('express');
const { getAllChallans, getAllChallansOfUser, getSingleChallanById, updateChallanStatus,  } = require('../controllers/challanController');
const router = express.Router();

router.get('/all', getAllChallans);
router.get('/user/:userId', getAllChallansOfUser);
router.get('/single/:id', getSingleChallanById);
router.put('/update/:id/status', updateChallanStatus);

module.exports = router;